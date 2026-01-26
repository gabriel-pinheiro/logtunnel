# logtunnel

`logtunnel` (`lt`) is a CLI tool that helps you search logs, parse them into structured data, filter by fields, and reformat them for reading or other tools.

## Installation

```bash
npm i -g logtunnel
```

If you are on Linux, you might need `sudo` depending on your setup.

## Tutorial

### The simplest form: find lines

`lt <filter>` is shorthand for “keep only lines that match this regex” (case-insensitive).

```bash
curl -s https://cdn.codetunnel.net/lt/text.log | lt error
```

You can also use `-f`/`--filter` multiple times (AND behavior, all filters must match). For lines containing both checkout and alice, you could use:

```bash
curl -s https://cdn.codetunnel.net/lt/text.log | lt -f checkout -f alice
```

### Ignore noise

Use `-i`/`--ignore` to drop lines that match those regexes:

```bash
curl -s https://cdn.codetunnel.net/lt/text.log | lt -i healthz -i metrics
```

Find something while ignoring other things:

```bash
curl -s https://cdn.codetunnel.net/lt/text.log | lt -f error -i NullPointer -i "retrying in"
```

Tip: `-f` and `-i` always run against the original input line (before parsing). If you want “filter by JSON fields”, use `-F` with a parser.

### Parse logs (turn text into structured data)

Parsing makes each line become an “event object”, enabling field filters (`-F`) and structured outputs (`-o json`, `-o logfmt`, `-o table`, templates, etc).

Supported parsers:

- `-p json` (one JSON object per line)
- `-p logfmt` (key=value log lines)
- `-p table` (space-aligned tables like `kubectl get pods`)
- `-p '<regex with named groups>'` (custom parsing using RegExp named groups)

#### Parse JSON and format a clean line

```bash
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o '[{{ts}} {{upper level}}] {{message}}'
```

#### Parse logfmt and convert to JSON (great for piping into other tools)

```bash
curl -s https://cdn.codetunnel.net/lt/logfmt.log | lt -p logfmt -o json
```

#### Parse JSON and show “human friendly structured output”

Default output (no `-o`) is “inspect”, objects are pretty-printed with colors.

```bash
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json
```

Use `-o inspect` to force multi-line output (useful for large or nested objects):

```bash
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o inspect
```

### Custom formats

When you pass a string to `-o` that isn’t one of `json|logfmt|inspect|original|table`, `lt` treats it as a Bigodon template (a safe Mustache/Handlebars-like language).

It supports:

- Variables: `{{message}}`, `{{ts}}`, `{{kubernetes.pod}}`
- Helpers: `{{upper level}}`, `{{lower user.email}}`, `{{toFixed delay_ms 2}}`
- Nested expressions: `{{capitalize (lower level)}}`

Example (compact “service log line”):

```bash
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o '[{{ts}}] {{service}} {{kubernetes.namespace}}/{{kubernetes.pod}} {{upper level}} {{message}}'
```

You can find the bigodon language reference [here](https://github.com/gabriel-pinheiro/bigodon/blob/main/LANGUAGE.md) and the available helpers [here](https://github.com/gabriel-pinheiro/bigodon/blob/main/HELPERS.md).

### Field filters (`-F <expression>`)

`-F/--field` filters *parsed objects* (so it requires `-p ...`). You can specify `-F` multiple times; all field filters must match (AND behavior).

Common helpers you’ll use in field filters:

- comparisons: `gt`, `gte`, `lt`, `lte`, `eq`, `and`, `or`, `not`
- strings: `lower`, `upper`, `startsWith`, `endsWith`
- `includes` works for strings and arrays

Show only slow requests (delay over 200ms):

```bash
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -F 'gt delay_ms 200' -o inspect
```

Case-insensitive “message contains alice”:

```bash
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -F 'includes (lower message) "alice"' -o '[{{ts} {{upper level}}] {{message}}'
```

Combine multiple conditions:

```bash
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -F 'and (eq level "error") (gt http.status 499)' -o '[{{ts}} {{upper level}}] {{message}}'
```

Show the *original raw line* after field filtering:

```bash
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -F 'gt delay_ms 200' -o original
```

#### Tip: General filter combined with expression filters

Inclusion (`-f`) and exclusion (`-i`) filters are ~5x faster than field filters (`-F`) because they skip the parsing step. If you can apply a broader filter with `-f`/`-i` before the more specific `-F` filter, it'll be much quicker on large files. If you are seeing poor performance on filters like:

```
curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -F 'eq level "error"' -o original
```

And you can't use filters like this because they'd show loglines that are of level INFO but contain the "error" string on the message:

```
curl -s https://cdn.codetunnel.net/lt/json.log | lt -f error
```

You can combine both to reduce the amount of parsed lines with the `-f` filter before the more specific `-F`:

```
curl -s https://cdn.codetunnel.net/lt/json.log | lt -f error -p json -F 'eq level "error"' -o original
```

### Kubernetes tables

`-p table` is designed for outputs like `kubectl get pods -A` (space-separated columns).

Find all pods (`kubectl get pods -A`) but ignore lines containing kube-system:

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -i kube-system
```

As the pods on the kube-system namespace had longer names, this log will be wider (requiring a wider terminal before wrapping) because kubernetes still considered their length to build the table, other things like the time since the last restart, longer status names (CrashLoopBackOff) can make the original table wider.

You can use `-p table` to parse the table, filters to include/exclude lines, and `-o table` to output a new table, considering the length of the selected lines, only. The command above printed the table as wide as kubernetes generated, this one prints a narrower one:

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -p table -o table -i kube-system
```

If you are looking for all pods containing the word `gateway`, you might end up excluding the headers row:

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt gateway
```

You can always print the headers row with `-H`:

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -H gateway
```

### Kubernetes -k option and more examples

On kubectl commands, you most likely want to parse the table (`-p table`) and reformat as a new table (`-o table`). You can use the `-k` as an alias to `-p table -o table`:

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -k payment
```

When parsing the table with `-p table`, you can filter with custom logic using the field filters (`-F`), you can get pods with at least one restart:
```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -k -F 'gt RESTARTS 0'
```

Show pods that are not fully ready (`READY` looks like `1/2`):

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -p '(?<up>\d+)/(?<total>\d+)' -F 'lt up total' -H -o original
```

Or, combining multiple lts to re-format the table:

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -p '(?<up>\d+)/(?<total>\d+)' -F 'lt up total' -H -o original | lt -k
```

Or, using just templates:

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -k -F 'lt (itemAt (split READY "/") 0) (itemAt (split READY "/") 1)'
```

Convert `kubectl` table output to logfmt for easier downstream filtering:

```bash
curl -s https://cdn.codetunnel.net/lt/table.log | lt -p table -o logfmt
```

### Custom regex parsing (`-p '(?<name>...)'`)

Use a regex with named groups to “extract fields” from unstructured text:

```bash
curl -s https://cdn.codetunnel.net/lt/text.log | lt -p '(?<ts>\S+) \[(?<level>\w+)\] (?<message>.*)' -o logfmt
```

Then field-filter on extracted fields:

```bash
curl -s https://cdn.codetunnel.net/lt/text.log | lt -p '(?<delay_ms>\d+)ms' -F 'gt delay_ms 200' -o original
```

## Reference

### Options

- `lt <filter>`: shorthand for a single text filter
- `-f, --filter <regex>`: keep lines that match this regex (repeatable)
- `-i, --ignore <regex>`: drop lines that match this regex (repeatable)
- `-p, --parser <json|logfmt|table|regex>`: parse each line into an object
- `-F, --field <bigodon expression>`: filter parsed objects by expression (repeatable)
- `-o, --output <format|template>`: output `json|logfmt|inspect|original|table` or a Bigodon template
- `-H, --headers`: always output the first input line (table headers)
- `-k, --kubectl`: shortcut for `-p table -o table`
- `-h, --help`: show help
- `-v, --version`: show version

### Formats at a glance

- `-o original`: print the original input line (even after parsing/filtering)
- `-o inspect` (or default): print objects with colors for humans
- `-o json`: emit JSON objects
- `-o logfmt`: emit `key=value` lines
- `-o table`: render a table from parsed objects (buffers until EOF)
- `-o '<bigodon template>'`: render a custom line from parsed objects

For the built-in help (includes examples): `lt --help`.
