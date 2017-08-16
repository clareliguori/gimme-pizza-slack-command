# gimme-pizza-slack-command
Slack command that orders a pizza from Domino's. For example: /gimmepizza

Includes:
- AWS Lambda handler: Package into a Lambda deployment package. Can be combined with an API Gateway to accept the command requests from Slack.
- Dockerfile: Package a web app into a Docker image. Can be used with ECS and ELB to accept the command requests from Slack.
- AWS CodeBuild buildspecs for both options above.

FOR DEMO PURPOSES ONLY

Uses [pizzapi](https://github.com/RIAEvangelist/node-dominos-pizza-api) npm module, which never actually orders a pizza (no payment information present).  It will find the nearest Domino's store and mock purchasing the pizza.