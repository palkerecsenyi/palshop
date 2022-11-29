import { useShopMetadataContext } from "../data/shops"
import { currencyFormat } from "../data/util"
import PageContainer from "../components/PageContainer"
import HomeLink from "../components/HomeLink"

export default function ShopFees() {
    const shops = useShopMetadataContext()

    return <PageContainer>
        <HomeLink />

        <h1 className="title">
            Current shop fees
        </h1>

        <p>
            These fees will be charged if you order a single item from the respective shop. Ordering more than one item
            from a given shop will not change the delivery fee you pay.
        </p>

        <div className="content">
            <ul>
                {shops.map(shop => <li key={shop.id}>
                    {shop.name}: <strong>{currencyFormat(shop.deliveryFee)}</strong>
                </li>)}
            </ul>
        </div>
    </PageContainer>
}
