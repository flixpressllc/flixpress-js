# Flixpress JS

Houses functionality for Flixpress.com

To use the build tools, be sure to inlcude a file in the root directory (same as this file) that is named `aws.json` which contains your credentials for AWS. It should look like this:

```json
{
  "key": "SOMETHING",
  "secret": "SOMETHING+ELSE"
}
```

:exclamation::exclamation::exclamation: CAUTION: `.gitignore` is setup to ignore the `aws.json` file. If you rename it to something else, Git will pull it in by default with a commit and then syncing to GitHub will __publish your AWS credentials__. Please do not do that.