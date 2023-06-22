# dataverse-metrics

## Introduction

dataverse-metrics report metrics in a web page

It is an installation-level metrics app (v5.1+) that can show metrics for a Dataverse instance or for any sub-Dataverse within that instance


This installation-level app leverages enhancements to the Dataverse Metrics API introduced in v5.1 to provide more detailed information about a single installation of Dataverse. It adds additional graphs showing the distribution of files by content type, 'Make Data Counts' metrics, and the number of 'unique downloaders' per dataset. All of these metrics can be displayed for the entire repository or for any sub-Dataverse within the repository, with the selection possible via a tree widget showing the overall structure of the repository, or programatically by adding a query parameter for the specific sub-Dataverse to the URL for the app. All outputs are also available in comma-separated-value (CSV) format via download buttons associated with each graph. This app does not use any local cache and doesn't require python or a cron job to run.

The 'App' report metrics only for published content and hence they do not require any login or Dataverse credentials to access.

## Requirements

- Apache web server or similar
- a web browser

## Installation

### Put code into place

Change to the parent directory for where you will install dataverse-metrics. `/var/www/html` is the default "DocumentRoot" for Apache on CentOS (defined in `/etc/httpd/conf/httpd.conf`) and is suggested as a place to install dataverse-metrics, but you are welcome to install it wherever you want and use any server you want.

    cd /var/www/html

Clone the repo:

    git clone https://github.com/IQSS/dataverse-metrics.git

Change to the directory you just created by cloning the repo:

    cd dataverse-metrics

### Configuration

Copy `config.local.json.sample` to `config.local.json` and edit the following values:

- `installationURL` - the URL for the Dataverse instance, e.g. "https://demo.dataverse.edu", can be "" if the app is deployed on the same server as Dataverse itself
- `installationName` - the name of the Dataverse Repository, e.g. "Harvard Dataverse"

and optionally:

-  `dataverseTerm` - defaults to "Dataverse" - used in the app to refer to sub-dataverses, e.g. using "Collection" would result in the app showing "Click a sub-Collection name to see its metrics".
-  `maxBars` - default is 100 - the maximum number of datasets to show in the uniquedownloads by PID display. That graph is ordered by number of counts, so setting the maxBars limits the graph to the 'top <N>' results (for visibility, the CSV download will contain the full results)
- graph colors can also be changed in the config file.


Using the instructions above, index.html files have been placed at 

- for the installation-level app: /var/www/html/dataverse-metrics/index.html

and should be available on your Apache server at http://example.com/dataverse-metrics/index.html

## Contributing

We love contributors! Please see our [Contributing Guide](CONTRIBUTING.md) for ways you can help and check out the to do list below.

## To Do

- Drop support for Python 2. See https://python3statement.org

##Links

[![Build Status](https://travis-ci.org/IQSS/dataverse-metrics.svg?branch=master)](https://travis-ci.org/IQSS/dataverse-metrics)

[Metrics API](http://guides.dataverse.org/en/latest/api/metrics.html)

[map](https://dataverse.org/installations)

[dataverse-installations](https://github.com/IQSS/dataverse-installations)

[cron](https://en.wikipedia.org/wiki/Cron)

[Contributing Guide](CONTRIBUTING.md)

[PEP 373](https://www.python.org/dev/peps/pep-0373/)
