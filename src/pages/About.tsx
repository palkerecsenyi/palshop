import { Link } from "react-router-dom"

export default function About() {
    return <div className="container py-6 px-4">
        <Link to="/" className="button mb-4">
            Back home
        </Link>

        <h1 className="title">
            About PalShop
        </h1>

        <div className="content">
            <p>
                PalShop is an&nbsp;
                <a
                    href="https://github.com/palkerecsenyi/palshop"
                    target="_blank"
                    rel="noreferrer"
                >
                    open-source
                </a>
                &nbsp;tool for sharing the costs of regular grocery trips with a larger group of people,
                making it easier to pool a grocery order for better economies of scale.
            </p>
            <p>
                Trips are added manually by an administrator, after which customers can add a list of the items they'd like to
                purchase from each supermarket. They can even add items from several different supermarkets to their orders.
                The items to add can be found on the relevant supermarkets' websites.
            </p>
            <p>
                After the deadline for adding items is reached and the order is placed with the supermarket(s), an invoice
                is automatically sent to all users who made a purchase via Stripe. Payments are made directly via Stripe,
                not on this website.
            </p>
            <p>
                All transactions will be made in <strong>£GBP</strong>.
            </p>

            <h2>
                Refunds
            </h2>
            <p>
                Occasionally, a supermarket may substitute an item for a cheaper alternative or cancel it entirely,
                refunding the difference. In such cases, a credit will be applied to the customer's account, which can be
                used as a discount on their next order. Alternatively, they can also ask for a refund to their payment method
                (e.g. debit card or bank account).
            </p>
            <p>
                Similarly, if a mistake is made while placing the order (e.g. an item is missed out) the customer will get
                a credit/refund applied to their account.
            </p>

            <h2>
                Privacy
            </h2>
            <p>
                PalShop handles minimal personal information:
                <ul>
                    <li>
                        The customer's name and email address are stored to identify them and connect them to their purchases.
                        These details are stored and processed both by Stripe and Google. The website administrator
                        also has access to this information. This information may also be shared with other customers
                        to help distribute grocery orders when they arrive.
                    </li>
                    <li>
                        The customer's card details are stored securely by Stripe. The full details cannot be revealed
                        to the website administrator.
                    </li>
                    <li>
                        The customer's purchase history including the items purchased in each individual order are stored
                        both by Stripe and Google. The customer can&nbsp;
                        <Link to="/history">
                            access their history
                        </Link>
                        &nbsp;at any time. The website administrator also has access to this information. The information
                        about the customer's purchases may also be shared with other customers to help distribute
                        grocery orders when they arrive.
                    </li>
                </ul>
            </p>
            <p>
                Data about trips (including the items purchased by each customer) are deleted 1 year after the trip
                was delivered.
            </p>
            <p>
                Customers have the right to rectify, access, and delete their data under the Data Protection Act 2018.
                To make a Subject Access Request, they should contact <strong>palshop-support@s.palk.me</strong>.
            </p>

            <h2>
                Support
            </h2>
            <p>
                For general queries or concerns related to PalShop, customers should contact <strong>palshop-support@s.palk.me</strong>.
            </p>
        </div>
    </div>
}
