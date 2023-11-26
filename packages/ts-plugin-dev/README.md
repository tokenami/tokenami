# @tokenami/ts-plugin-dev

to debug:

- run `TSS_DEBUG=5667 code examples/remix --user-data-dir ~/.vscode-debug/` to open example project in a separate clean editor (port can be whatever you want)
  - open any typescript file
  - `CMD+Shift+P` > `Select TypeScript version...` > `Use Workspace Version`
  - `CMD+Shift+P` > `Restart TS server`
- open monorepo in separate vscode window (for debugging and dev)
  - in debug tab choose `Attach to VS Code Server...` and press play
  - choose option with port `5667` (or whichever port you chose)
- make changes in the `examples/remix` editor to hit `debugger` statements
