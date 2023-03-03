import { regionalFunctions } from "./util"
import { CloudTasksClient, protos } from "@google-cloud/tasks"
import type { Timestamp } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { Buffer } from "buffer"
import { OAuth2Client } from "google-auth-library"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

const tasksClient = new CloudTasksClient()
const queueName = functions.config().trip_close_queue.queue_name
const taskURL = functions.config().trip_close_queue.url
const taskServiceAccount = functions.config().trip_close_queue.sa_email
const tasksQueue = tasksClient.queuePath("palshop-web", "europe-west2", queueName)
const audience = functions.config().trip_close_queue.aud

const authClient = new OAuth2Client()

type Trip = {
    itemsDeadline: Timestamp
    status: number
    task?: string
}

export const closeTrip = regionalFunctions.https
    .onRequest(async (req, res) => {
        let authorizationHeader = req.headers.authorization

        if (!authorizationHeader) {
            res.status(400)
            res.send("Authorization header missing")
            return
        }

        // remove "Bearer "
        authorizationHeader = authorizationHeader.slice(7)

        try {
            await authClient.verifyIdToken({
                audience,
                idToken: authorizationHeader,
            })
        } catch (e) {
            res.status(401)
            res.send("Token invalid")
            return
        }

        const tripId = req.body["trip"]
        if (!tripId) {
            res.status(400)
            res.send("Trip ID missing")
            return
        }

        const firestore = getFirestore()
        await firestore.collection("trips").doc(tripId).update({
            status: 1,
            task: FieldValue.delete(),
        })

        res.sendStatus(200)
    })

export const scheduleTripClose = regionalFunctions.firestore
    .document("trips/{trip}")
    .onWrite(async change => {
        let data: Trip & {id: string}
        if (change.after.exists) {
            data = {
                id: change.after.id,
                ...change.after.data() as Trip
            }
        } else {
            // if after does not exist then before must
            data = {
                id: change.before.id,
                ...change.before.data() as Trip
            }
        }

        if (change.after.exists && change.before.exists) {
            const beforeData = change.before.data() as Trip
            // no need to update anything
            if (beforeData.itemsDeadline.isEqual(data.itemsDeadline)) {
                return
            }
        }

        if (data.task) {
            const request: protos.google.cloud.tasks.v2.IDeleteTaskRequest = {
                name: data.task,
            }
            // it's not really a problem if this fails (e.g. if we failed to update the ID after deleting previously)
            try {
                await tasksClient.deleteTask(request)
            } catch (e) {
                console.warn("Delete task failed!", e)
            }
        }

        // If the trip just got deleted, we don't need to do anything else
        if (!change.after.exists) return

        const taskPayload = {
            trip: data.id,
        }

        const task: protos.google.cloud.tasks.v2.ITask = {
            httpRequest: {
                headers: {
                    "Content-Type": "application/json",
                },
                httpMethod: "POST",
                url: taskURL,
                oidcToken: {
                    serviceAccountEmail: taskServiceAccount,
                    audience,
                },
                body: Buffer.from(JSON.stringify(taskPayload)).toString('base64'),
            },
            scheduleTime: {
                seconds: data.itemsDeadline.seconds,
            }
        }

        const request: protos.google.cloud.tasks.v2.ICreateTaskRequest = {
            parent: tasksQueue,
            task,
        }

        const [response] = await tasksClient.createTask(request)
        await change.after.ref.update({
            task: response.name,
        })
    })
