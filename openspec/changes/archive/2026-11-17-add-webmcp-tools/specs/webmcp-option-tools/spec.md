# Spec Delta

## Purpose

Exposes the Home Manager option search and single option lookup to browser based AI
agents as WebMCP tools, so an agent can query canonical option names, types and
defaults without scraping the page.

## ADDED Requirements

### Requirement: Option tools are registered only where WebMCP exists

The site SHALL register its option tools when the browsing context exposes a WebMCP
model context, and SHALL behave as an ordinary search page without errors when it does
not.

#### Scenario: Browser exposes the API

- **WHEN** the page loads in a browser where `document.modelContext` or `navigator.modelContext` is available
- **THEN** the option tools are registered and discoverable by the agent

#### Scenario: Browser has no WebMCP support

- **WHEN** the page loads in a browser without either API
- **THEN** the page renders and searches as before, with no registration attempt and no error output

### Requirement: Tools wait for option data

A tool call made before the option data has finished loading SHALL resolve once the
data is available, rather than fail or return an empty result.

#### Scenario: Tool called during initial data load

- **WHEN** an agent calls a tool while the option data request is still pending
- **THEN** the call completes after the data has loaded and returns data based results

### Requirement: search_options returns ranked matches

The `search_options` tool SHALL accept a required `query` string of at least one
character, and SHALL return the matches that the page's own search returns for the
same query, in the same order.

#### Scenario: Query with matches

- **WHEN** an agent calls `search_options` with `query` set to `hyprland`
- **THEN** the tool returns the matching options in the order the page would display them

#### Scenario: Query with no matches

- **WHEN** an agent calls `search_options` with a query that matches nothing
- **THEN** the tool reports an empty result set rather than an error

### Requirement: search_options bounds its output

The `search_options` tool SHALL accept an optional `limit` between 1 and 25 that
defaults to 10, and each returned record SHALL contain only the option title, type,
default value, declaration names, a one sentence description summary, and a page URL
that opens that option.

#### Scenario: Default limit

- **WHEN** an agent calls `search_options` without `limit` for a broad query
- **THEN** at most 10 records are returned

#### Scenario: Explicit limit

- **WHEN** an agent calls `search_options` with `limit` set to 25
- **THEN** at most 25 records are returned

### Requirement: get_option returns one full record

The `get_option` tool SHALL accept an exact option `title` and return that option's
full record, including description, example, default, type, read only flag, and
declaration names with links.

#### Scenario: Exact title exists

- **WHEN** an agent calls `get_option` with `title` set to `programs.git.enable`
- **THEN** the tool returns the full record for that option

#### Scenario: Exact title does not exist

- **WHEN** an agent calls `get_option` with a title that is not present in the loaded data
- **THEN** the tool reports that no option with that title exists, and names the title it searched for

### Requirement: Tool results identify the release

Every tool result SHALL state which Home Manager release the returned data came from.

#### Scenario: Result carries release

- **WHEN** any option tool returns data
- **THEN** the result identifies the release selected on the page

### Requirement: Tools are annotated as read only

Both tools SHALL be registered as read only and SHALL declare that their output
contains untrusted third party content.

#### Scenario: Annotations present

- **WHEN** an agent inspects the registered tools
- **THEN** each tool carries a read only hint and an untrusted content hint
