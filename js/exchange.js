const CurrencyWidget = () => {
    const [rates, setRates] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [selectedCurrency, setSelectedCurrency] = React.useState("UAH");
    const [source, setSource] = React.useState("UAH");
    const [selectedCurrencyPrice, setSelectedCurrencyPrice] = React.useState(1);

    const API_URL = host + `/currency`;

    React.useEffect(() => {
        fetchRates()
    }, [])

    function calculatePrice(priceInUah) {
        return `${Intl.NumberFormat("uk-UA").format((priceInUah * selectedCurrencyPrice).toFixed(2))} ${selectedCurrency}`
    }

    const fetchRates = async () => {
        if (loading) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error("Помилка запиту до API валют");
            }
            const data = await response.json();

            if (!data.success) {
                throw new Error();
            }

            setRates({ ...data, quotes: { "UAHUAH": 1, ...data.quotes } });
            setSource(data.source)
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="currency-widget">
            <h2>Курси валют</h2>



            <div className="select-currency-wrapper">
                <label htmlFor="currency-select">Оберіть валюту:</label>
                <select
                    id="currency-select"
                    value={selectedCurrency}
                    onChange={(e) => { setSelectedCurrency(e.target.value); setSelectedCurrencyPrice(rates.quotes[source + e.target.value]) }}
                    disabled={!rates}
                >
                    {rates && (
                        <>{

                            Object.entries(rates.quotes).map(([pair, value]) => (
                                <option key={pair}>
                                    {pair.replace(source, "")}
                                </option >
                            ))
                        }</>
                    )}
                </select>

                <button className="refresh-btn spin" onClick={fetchRates} disabled={loading}>
                    <img className={loading ? "refresh-image refresh-image-spin" : "refresh-image"} src="../img/refresh.png"></img>
                </button>
                {error && <p className="error" style={{marginLeft:16}}>❌Помилка завантаження</p>}
            </div>
            {rates && <p className="sub-info">Оновлено: {rates ? new Date(rates.timestamp * 1000).toLocaleString() : ""}</p>}

            <p className="sub-info">*ліміт 100 запитів на годину</p>
            <h2 style={{ marginTop: 16, marginBottom: 8 }}>Ціни на квартири — ЖК «Лазурний Квартал», м. Київ</h2>

            <table style={{ marginBottom: 16 }}>
                <thead>
                    <tr>
                        <th>Тип квартири</th>
                        <th>Площа (м²)</th>
                        <th>Ціна за м²</th>
                        <th>Загальна вартість</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1-кімнатна</td>
                        <td>42</td>
                        <td>{calculatePrice(38000)}</td>
                        <td>{calculatePrice(1596000)}</td>
                    </tr>
                    <tr>
                        <td>2-кімнатна</td>
                        <td>63</td>
                        <td>{calculatePrice(37000)}</td>
                        <td>{calculatePrice(2331000)}</td>
                    </tr>
                    <tr>
                        <td>3-кімнатна</td>
                        <td>87</td>
                        <td>{calculatePrice(36000)}</td>
                        <td>{calculatePrice(3132000)}</td>
                    </tr>
                </tbody>
            </table>

        </div >
    );
};

// Рендер компонента в <div id="exchange">
const root = ReactDOM.createRoot(document.getElementById("exchange"));
root.render(<CurrencyWidget />);
