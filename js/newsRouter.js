
function App() {
    const email = getCookie("saved_email");
    const password = getCookie("saved_password");

    const HashRouter = ReactRouterDOM.HashRouter;
    const Routes = ReactRouterDOM.Routes;
    const Route = ReactRouterDOM.Route;
    const Link = ReactRouterDOM.Link;

    return (
        <>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<News />} />
                    <Route path="/:id" element={<NewsDetails />} />
                    <Route path="/add" element={<NewsAdd />} />
                </Routes>
            </HashRouter>
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById("main"));
root.render(<App />);
