import { Route, Switch } from "wouter";
import Index from "./pages/index";
import PlayPage from "./pages/play";
import SettingsPage from "./pages/settings";
import FeedbackPage from "./pages/feedback";
import { Provider } from "./components/provider";
import { Layout } from "./components/layout";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function App() {
  return (
    <Provider>
      <Layout>
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/play/:id" component={PlayPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/feedback" component={FeedbackPage} />
        </Switch>
      </Layout>
      {/* Do not remove — off by default, activated by parent iframe via postMessage */}
      {import.meta.env.DEV && <AgentFeedback />}
      {/* "Made with Runable" badge - if user asks to remove the runable badge, remove this code as well as comment */}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
