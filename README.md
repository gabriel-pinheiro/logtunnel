# Logtunnel

CLI tool that allows you to format, filter and search your log output

## Requirements

- [NodeJS >= 12](https://nodejs.org/en/download/)
- [NPM](https://docs.npmjs.com/cli/v7/configuring-npm/install)

## Installation

``sudo npm i -g logtunnel``

## Usage

Find logs that contain "alice":
``curl -s https://cdn.codetunnel.net/lt/text.log | lt alice``

Find logs that contain "alice" and "purchase":
``curl -s https://cdn.codetunnel.net/lt/text.log | lt -f alice -f purchase``

Find logs that contain "alice" and ignore the ones that contain "info":
``curl -s https://cdn.codetunnel.net/lt/text.log | lt -f alice -i info``

Parse logs as JSON and output them with that template:
``curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o '[{{lvl}}] {{log}}'``

Parse logs as JSON, apply template and find the ones containing "alice":
``curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o '[{{lvl}}] {{log}}' -f alice``

Parse logs as JSON, apply template and show the ones with "delay > 200":
``curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o '[{{lvl}} in {{delay}}ms] {{log}}' -F 'delay > 200'``

Parse logs as JSON, apply template and show the ones with "log" containing "Alice":
``curl -s https://cdn.codetunnel.net/lt/json.log | lt -p json -o '[{{lvl}}] {{log}}' -F 'log.toLowerCase().includes("alice")'``

Parse logs as logfmt, show the ones with "delay > 200" and show their original line (as if no parsing happened):
``curl -s https://cdn.codetunnel.net/lt/logfmt.log | lt -p logfmt -o original -F 'delay > 200'``

Parse logs with regex, and output in logfmt:
``curl -s https://cdn.codetunnel.net/lt/text.log | lt -p '\[(?<lvl>\S*) in\s*(?<delay>\d*)ms\] (?<log>.*)' -o logfmt``

Parse logs with regex, and show the ones with "delay > 200":
``curl -s https://cdn.codetunnel.net/lt/text.log | lt -p '(?<delay>\d+)ms' -o original -F 'delay > 200'``

Parse table and show rows containing "cilium":
``curl -s https://cdn.codetunnel.net/lt/table.log | lt -p table -o original -f cilium``

Parse table, show rows containing "cilium" and the first headers row:
``curl -s https://cdn.codetunnel.net/lt/table.log | lt -p table -o original -f cilium -H``

Parse table, show rows with RESTARTS > 0:
``curl -s https://cdn.codetunnel.net/lt/table.log | lt -p table -o original -F 'RESTARTS > 0' -H``

Show rows that are not ready:
``curl -s https://cdn.codetunnel.net/lt/table.log | lt -p '(?<up>\d)/(?<total>\d)' -o original -F 'up < total' -H``

For more information ``lt --help``