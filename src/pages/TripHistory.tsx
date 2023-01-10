import { Link } from "react-router-dom"
import { formatTripStatus, usePastTrips } from "../data/trips"
import { timestampFormat } from "../data/util"
import HomeLink from "../components/HomeLink"
import PageContainer from "../components/PageContainer"

export default function TripHistory() {
    const [trips] = usePastTrips()

    return <PageContainer>
        <HomeLink />

        <h1 className="title">
            Trip tracker
        </h1>

        {trips.map(trip => <div className="box mb-4" key={trip.id}>
            <p className="is-size-4">
                {timestampFormat(trip.itemsDeadline)}
            </p>
            <p>
                Status: {formatTripStatus(trip.status)}
            </p>
            <p>
                <Link to={`/history/${trip.id}`}>
                    View details
                </Link>
            </p>
        </div>)}
    </PageContainer>
}
