# GRCFlow GRC Automation

A browser-based prototype for GRC evidence automation.

## What It Does

- Manages a control library for SOC 2, ISO 27001, PCI DSS, and SOX ITGC controls.
- Creates evidence requests with owner, due date, and generated request message.
- Tracks evidence submissions and request status.
- Tests evidence sufficiency with a rule-based evaluator.
- Generates reviewer comments for pass, fail, and needs-review outcomes.
- Exports an audit packet JSON for review.

## SOX ITGC Coverage

The prototype includes SOX ITGC controls for:

- User access provisioning
- Terminated user access removal
- Privileged access review
- Production change approval
- Job monitoring and incident resolution

## Run Locally

Open `index.html` in a browser, or serve the folder with a static server:

```bash
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173`.

## Prototype Note

This is currently a frontend-only prototype using browser local storage. The `AI evaluator contract` panel shows the JSON shape intended for replacing the rule-based tester with a backend AI evaluator.
