import { regionalFunctions } from "./util"
import { CloudTasksClient, protos } from "@google-cloud/tasks"
import type { Timestamp } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { Buffer } from "buffer"

const tasksClient = new CloudTasksClient()
const queueName = functions.config().trip_close_queue.queue_name
const taskURL = functions.config().trip_close_queue.url
const taskServiceAccount = functions.config().trip_close.sa_email
const tasksQueue = tasksClient.queuePath("palshop-web", "europe-west2", queueName)

type Trip = {
    itemsDeadline: Timestamp
    status: number
    task?: string
}

export const closeTrip = regionalFunctions.https
    .onRequest(async (req, res) => {

    })

export const scheduleTripClose = regionalFunctions.firestore
    .document("trips/{trip}")
    .onWrite(async change => {
        let data: Trip & {id: string}
        if (change.after) {
            data = {
                id: change.after.id,
                ...change.after.data() as Trip
            }
        } else {
            data = {
                id: change.before.id,
                ...change.before.data() as Trip
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
            }
        }
        if (!change.after) return

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
