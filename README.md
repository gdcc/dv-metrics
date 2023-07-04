# dv-metrics

## Introduction

dv-metrics report metrics in a web page

It is an installation-level metrics app (v5.1+) that can show metrics for a Dataverse instance 
or for any sub-Dataverse within that instance


This installation-level app leverages enhancements to the Dataverse Metrics API introduced in v5.1 
to provide more detailed information about a single installation of Dataverse. 
It adds additional graphs showing the distribution of files by content type, 'Make Data Counts' metrics, 
and the number of 'unique downloaders' per dataset. 
All of these metrics can be displayed for the entire repository or for any sub-Dataverse within the repository, 
with the selection possible via a tree widget showing the overall structure of the repository, 
or programmatically by adding a query parameter for the specific sub-Dataverse to the URL for the app. 
All outputs are also available in comma-separated-value (CSV) format via download buttons associated with each graph. 
This app does not use any local cache and doesn't require Python or a cron job to run.

This app report metrics only for published content and hence it does not require any login or Dataverse credentials to access.
More detail about the Dataverse metrics can be found in the guides: [Metrics API](http://guides.dataverse.org/en/latest/api/metrics.html).

## Requirements

- Apache web server or similar
- a web browser

## Installation

### Put code into place

Change to the parent directory for where you will install dv-metrics. `/var/www/html` is the default "DocumentRoot" 
for Apache on CentOS (defined in `/etc/httpd/conf/httpd.conf`) and is suggested as a place to install dv-metrics, but you are welcome to install it 
wherever you want and use any server you want.

    cd /var/www/html

Clone the repo:

    git clone https://github.com/gdcc/dv-metrics.git

Or you can also download the latest code and unarchive it:

    wget https://github.com/gdcc/dv-metrics/archive/refs/heads/master.zip
    unzip master.zip
    mv dv-metrics-master dv-metrics

__Note__: Downloading the latest release would be preferable if you are not developing on the code or if you install it on a production server.


### Configuration

Change to the directory you just created:

    cd dv-metrics

Copy `config.local.json.sample` to `config.local.json` and edit the following values:

- `installationURL` - the URL for the Dataverse instance, e.g. "https://demo.dataverse.edu", 
   can be "" if the app is deployed on the same server as Dataverse itself
- `installationName` - the name of the Dataverse Repository, e.g. "Harvard Dataverse"

Using the instructions above, the index.html file has been placed at: 
`/var/www/html/dv-metrics/index.html`
and should be available on your Apache server at http://example.com/dv-metrics/index.html. 

__Note__: Make sure the page is available by adding the following to your apache config; ` ProxyPassMatch ^/dv-metrics !`. 

#### More configuration using `config.local.json`.

- `dataverseTerm` - defaults to "Dataverse" - used in the app to refer to sub-dataverses,
  e.g. using "Collection" would result in the app showing "Click a sub-Collection name to see its metrics".
- `maxBars` - default is 100 - the maximum number of datasets to show in the uniquedownloads by PID display.
  That graph is ordered by number of counts, so setting the maxBars limits the graph to the 'top <N>' results
  (for visibility, the CSV download will contain the full results)
- graph colors and descriptions can also be changed in the config file.

Parts of the page rendering can be toggled on/off using the configuration.

- `makeDataCount` - The Make Data Count section, which is best to remove when the Dataverse instance does not support this.
  Removal prevents all the API calls that won't have a result.
- `dvSelect` - The dataverse (collection) selection via a 'tree'; which useful if the Dataverse instance only has one collection (the root).
- All the other graphs. Sometimes some graphs don't work well for some reason.
  Also, some graphs do not make sense, for instance when there is only one collection (sub-verses),
  the graphs that show 'dataverses' could be removed.
  For example on an instance with no collections and no MDC:
  ```json
  "dvSelect": false,
  "timeseries.dataverses": false,
  "dataversesbysubject": false,
  "dataversesbycategory": false,
  "makeDataCount": false,
  ```

#### Changing style and layout

A Lot of style changes can be accomplished by changing the `style.css`. 
Some things are difficult to change via CSS only and need editing of the `index.html`.

__Note__: After a new release you have to reapply the changes you made, 
and some might not work anymore. 


#### Dataverse configuration: 

Typically, you also configure your Dataverse instance to allow easy 'navigating' to the metrics from the Dataverse web page.
See the Dataverse Guide: [MetricsUrl Guide](https://guides.dataverse.org/en/latest/installation/config.html#metricsurl).

## Contributing

We love contributors! Please see our [Contributing Guide](CONTRIBUTING.md) for ways you can help and check out the to do list below.

## To Do

- Improve support for different usage scenarios by configurability 
- Upgrade libraries (jquery, d3js, bootstrap?). 

## History

This code repository has been 'Extracted' from its predecessor at IQSS; [https://github.com/IQSS/dataverse-metrics](https://github.com/IQSS/dataverse-metrics)
The later `dv-metrics` repo started with the code from the IQSS `dataverse-metrics` version `v0.2.9`, 
but with all the code removed that implemented the 'global installation'. 
As a result there is no Python code in here that was originally needed for the (server side) aggregation of metrics from all Dataverse instances. 

## Links

[Contributing Guide](CONTRIBUTING.md)

[Metrics API](http://guides.dataverse.org/en/latest/api/metrics.html)

[MetricsUrl Guide](https://guides.dataverse.org/en/latest/installation/config.html#metricsurl)

