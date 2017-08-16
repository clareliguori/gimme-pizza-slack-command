# gimme-pizza-slack-command
Slack command that orders a pizza from Domino's. For example: /gimmepizza

Includes:
- AWS Lambda handler: Package into a Lambda deployment package. Can be combined with an Amazon API Gateway to accept the command requests from Slack.
- Dockerfile: Package a web app into a Docker image. Can be used with Amazon ECS and ELB to host the web app and accept the command requests from Slack.
- AWS CodeBuild buildspecs for both options above.

## FOR DEMO PURPOSES ONLY

Uses [pizzapi](https://github.com/RIAEvangelist/node-dominos-pizza-api) npm module, which never actually orders a pizza (no payment information present).  It will find the nearest Domino's store and mock purchasing the pizza.

## Instructions for Lambda setup

Start with slack-echo-command blueprint, set up the API Gateway, and upload a zip bundle containing this project + dependencies.

Follow these steps to configure the slash command in Slack:
  1. Navigate to https://<your-team-domain>.slack.com/services/new
  2. Search for and select "Slash Commands".
  3. Enter a name for your command and click "Add Slash Command Integration".
  4. Copy the token string from the integration settings and use it in the next section.
  5. After you complete this blueprint, enter the provided API endpoint URL in the URL field.

To encrypt your secrets use the following steps:
  1. Create or use an existing KMS Key - http://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html
  2. Click the "Enable Encryption Helpers" checkbox
  3. Paste the token string into the encryptedSlackToken environment variable and click encrypt.
  4. Give your function's role permission for the kms:Decrypt action.

Example:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1443036478000",
            "Effect": "Allow",
            "Action": [
                "kms:Decrypt"
            ],
            "Resource": [
                "<your KMS key ARN>"
            ]
        }
    ]
}
```