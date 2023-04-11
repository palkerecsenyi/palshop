import { Link } from "react-router-dom"
import { formatTripStatus } from "../data/trips"
import { timestampFormat } from "../data/util"
import HomeLink from "../components/HomeLink"
import PageContainer from "../components/PageContainer"
import { useHistoricTrips } from "../stores/historicTrips"
import { useAppSelector } from "../stores/hooks"

export default function TripHistory() {
    useHistoricTrips()

    const trips = useAppSelector(state => state.historicTripsReducer.trips)

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
