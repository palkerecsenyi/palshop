import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { useTripContext } from "../data/trips"

interface TimeRemaining {
    days: number
    hours: number
    minutes: number
    seconds: number
}

const TripCountdownElement = (
    {label, value}: {
        label: string,
        value: number,
    }
) => {
    return <div className="column">
        <p className="is-size-3 mb-0 has-text-centered">
            {value}
        </p>
        <p className="mt-0 has-text-centered">
            {label}
        </p>
    </div>
}

const TripCountdownLarge = ({
    timeRemaining
}: { timeRemaining: TimeRemaining }) => {
    return <div className="mb-5">
        <p className="mb-2">
            Trip closing in:
        </p>
        <div className="box">
            <div className="columns is-variable is-0-mobile">
                <TripCountdownElement
                    label="Days"
                    value={timeRemaining.days}
                />
                <TripCountdownElement 
                    label="Hours"
                    value={timeRemaining.hours}
                />
                <TripCountdownElement 
                    label="Minutes"
                    value={timeRemaining.minutes}
                />
                <TripCountdownElement
                    label="Seconds"
                    value={timeRemaining.seconds}
                />
            </div>
        </div>
    </div>
}

const TripCountdownMini = ({
    timeRemaining,
}: { timeRemaining: TimeRemaining }) => {
    return <p>
        Please add your items within&nbsp;
        {timeRemaining.days} days,&nbsp;
        {timeRemaining.hours} hours,&nbsp;
        {timeRemaining.minutes} minutes, and&nbsp;
        {timeRemaining.seconds} seconds.
    </p>
}

export default function TripCountdown () {
    const trip = useTripContext()

    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>()
    useEffect(() => {
        if (!trip) return
        const interval = setInterval(() => {
            const timeUntilTrip = DateTime.fromJSDate(trip.itemsDeadline.toDate()).diffNow(["days", "hours", "minutes", "seconds"])
            setTimeRemaining({
                days: timeUntilTrip.days,
                hours: timeUntilTrip.hours,
                minutes: Math.floor(timeUntilTrip.minutes),
                seconds: Math.floor(timeUntilTrip.seconds),
            })
        }, 500)
        return () => {
            clearInterval(interval)
        }
    }, [trip?.itemsDeadline])

    if (!timeRemaining) {
        return <div className="box" style={{
            height: 144,
        }} />
    }

    if (timeRemaining.days < 0 || timeRemaining.hours < 0 || timeRemaining.minutes < 0 || timeRemaining.seconds < 0) {
        // the trip deadline has already passed, it wouldn't make sense to display anything
        return <></>
    }

    if (timeRemaining.days > 0) {
        return <TripCountdownMini timeRemaining={timeRemaining} />
    }

    return <TripCountdownLarge timeRemaining={timeRemaining} />
}
