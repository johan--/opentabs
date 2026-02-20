import { Button, Text, Card, Badge } from "@/components/retroui";
import {
  GithubIcon,
  Puzzle,
  Bot,
  ShieldCheck,
  Zap,
  Globe,
  Wrench,
  Server,
  Chrome,
  Package,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/footer";

const features = [
  {
    title: "Plugin Architecture",
    description:
      "Anyone can publish OpenTabs plugins as standalone npm packages. The MCP server discovers them at runtime.",
    icon: Puzzle,
  },
  {
    title: "AI Agent Ready",
    description:
      "Connects to Claude Code, Cursor, and any MCP-compatible client via Streamable HTTP.",
    icon: Bot,
  },
  {
    title: "Zero Trust Access",
    description:
      "Uses your authenticated browser sessions. No API keys or OAuth tokens shared with AI agents.",
    icon: ShieldCheck,
  },
  {
    title: "Hot Reload",
    description:
      "The MCP server runs with bun --hot. File watchers detect plugin changes automatically.",
    icon: Zap,
  },
  {
    title: "Any Web App",
    description:
      "Works with any website — Slack, GitHub, Jira, Linear, and more. If you can use it in Chrome, agents can too.",
    icon: Globe,
  },
  {
    title: "Plugin SDK",
    description:
      "Define tools with Zod schemas. Build with opentabs build CLI. Publish as npm packages.",
    icon: Wrench,
  },
];

const steps = [
  {
    step: 1,
    title: "Install & Configure",
    description:
      "Clone the repo, run bun install and bun run build, then load the Chrome extension from ~/.opentabs/extension/.",
  },
  {
    step: 2,
    title: "Connect Your AI Agent",
    description:
      "Point any MCP client at http://localhost:9515/mcp with a Bearer token. Claude Code, Cursor, and others work out of the box.",
  },
  {
    step: 3,
    title: "Build Plugins",
    description:
      "Use the Plugin SDK to define tools with Zod schemas for any website. Publish as npm packages or use locally.",
  },
];

const architecture = [
  {
    title: "MCP Server",
    description:
      "Discovers plugins, registers their tools as MCP tools, dispatches tool calls to the Chrome extension via WebSocket.",
    icon: Server,
  },
  {
    title: "Chrome Extension",
    description:
      "Receives plugin definitions, injects adapter IIFEs into matching tabs, and executes tool calls in the page context.",
    icon: Chrome,
  },
  {
    title: "Plugin SDK",
    description:
      "Provides the OpenTabsPlugin base class, defineTool factory, and opentabs build CLI for building plugins.",
    icon: Package,
  },
];

export default function Home() {
  return (
    <main>
      <div className="flex flex-col items-center min-h-screen">
        {/* Hero */}
        <section className="container max-w-6xl mx-auto px-4 lg:px-0 flex justify-center items-center my-28">
          <div className="text-center w-full max-w-3xl">
            <Badge className="mb-4">Open Source</Badge>

            <Text as="h1" className="text-5xl text-foreground lg:text-6xl mt-8">
              AI agents for
              <br />
              any web app
            </Text>

            <p className="text-lg text-muted-foreground mb-8 mt-4">
              Give AI agents access to any web application through your
              authenticated browser session. No API keys needed.
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <Link href="/docs/install" passHref>
                <Button>Get Started</Button>
              </Link>
              <Link href="/docs" passHref>
                <Button variant="outline">Read the Docs</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container max-w-6xl mx-auto px-4 lg:px-0 lg:my-24">
          <Text as="h2" className="text-3xl text-center mb-12">
            Everything you need
          </Text>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 mb-8">
            {features.map((feature) => (
              <Card key={feature.title} className="w-full bg-background">
                <Card.Header>
                  <div className="flex items-center gap-3">
                    <feature.icon size={20} className="text-foreground" />
                    <Card.Title>{feature.title}</Card.Title>
                  </div>
                </Card.Header>
                <Card.Content>
                  <Text className="text-muted-foreground">
                    {feature.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="container max-w-6xl mx-auto px-4 lg:px-0 my-24">
          <Text as="h2" className="text-3xl text-center mb-12">
            How it works
          </Text>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {steps.map((item) => (
              <Card key={item.step} className="w-full bg-background">
                <Card.Header>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 border-2 border-foreground font-bold text-sm">
                      {item.step}
                    </span>
                    <Card.Title>{item.title}</Card.Title>
                  </div>
                </Card.Header>
                <Card.Content>
                  <Text className="text-muted-foreground">
                    {item.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section className="container max-w-6xl mx-auto px-4 lg:px-0 my-24">
          <Text as="h2" className="text-3xl text-center mb-4">
            Architecture
          </Text>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three components work together to give AI agents access to web
            applications through your browser.
          </p>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 mb-12">
            {architecture.map((item) => (
              <Card key={item.title} className="w-full bg-background">
                <Card.Header>
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="text-foreground" />
                    <Card.Title>{item.title}</Card.Title>
                  </div>
                </Card.Header>
                <Card.Content>
                  <Text className="text-muted-foreground">
                    {item.description}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </div>
          <div className="border-2 border-foreground bg-card p-6 lg:p-8 font-mono text-sm max-w-3xl mx-auto">
            <pre className="whitespace-pre overflow-x-auto text-foreground">
              {`┌─────────────┐  Streamable HTTP  ┌─────────────┐  WebSocket  ┌──────────────────┐
│  AI Agent   │ ←───────────────→ │ MCP Server  │ ←─────────→ │ Chrome Extension │
│             │  /mcp             │ (localhost)  │             │   (Background)   │
└─────────────┘                   └──────┬───────┘             └────────┬─────────┘
                                         │                              │
                                  ┌──────▼───────┐            ┌────────▼─────────┐
                                  │   Plugin     │            │  Adapter IIFEs   │
                                  │  Discovery   │            │  (injected into  │
                                  │ (npm + local)│            │   matching tabs) │
                                  └──────────────┘            └────────┬─────────┘
                                                                       │
                                                              ┌────────▼─────────┐
                                                              │   Web APIs       │
                                                              │ (user's session) │
                                                              └──────────────────┘`}
            </pre>
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="container max-w-6xl mx-auto border-2 bg-primary border-black py-16 px-4 lg:p-16 my-36">
        <Text as="h2" className="text-center text-black mb-2">
          Get Started
        </Text>
        <Text className="text-xl text-center text-black mb-8">
          OpenTabs is free and open source. Start building in minutes.
        </Text>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
          <Link href="/docs/install" passHref>
            <Button className="bg-background" variant="outline">
              Installation Guide
            </Button>
          </Link>
          <Link
            href="https://github.com/AnomalyCo/opentabs"
            target="_blank"
            passHref
          >
            <Button className="bg-background" variant="outline">
              <GithubIcon size="16" className="mr-2" />
              View on GitHub
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
