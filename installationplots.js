// The alias of the published dataverse to show statistics for (stats are for this dataverse and all published children)
var alias;
// The Dataverse server address - can be "" if this app is deployed on the same server.
var dvserver = "";

$(document).ready(function() {
  // Determine which dataverse/sub-dataverse is the focus for the metrics
  // (Metrics are for the specified public/published dataverse and all it's public/published children)
  var urlParams = new URLSearchParams(window.location.search);
  alias = (urlParams.get('parentAlias'));

  // Retrieve the configuration,  complete the header, and start creating graphs
  $.getJSON('config.local.json', function(config) {
    // Set the Dataverse server to use
    if (config.hasOwnProperty("installationURL")) {
      dvserver = config.installationURL;
    }
    if (!config.hasOwnProperty("dvSelect") || config["dvSelect"]) {
      // Retrieve the tree of child dataverses and add them to the tree we use as a selector
      // getJSON could be used throughout (it wasn't previously due to bugs in the API endpoints in determining when to send json versus text/csv)
      $.getJSON(
        dvserver + '/api/info/metrics/tree' + addAlias(),
        function(data) {
          var nodes = data.data;
          updateDisplayName(nodes.name, config);
          if (typeof nodes.children !== 'undefined') {
            nodes.children.forEach((node) => {
              // Make each element in the tree (below the root) a link to get the metrics for that sub-dataverse
              updateNames(node);
            });
          }
          // Populate the tree widget
          $('#dvtree').tree({
            data: [nodes],
            autoEscape: false
          });
        }
      );
    } else {
      $("#dvselect").parent().hide();
    }

    // Header Information
    $('#title').html("<H1>Metrics from the " + config.installationName + "</H1>");
    if (alias == null) {
      $('#subtitle').html("<h2>Showing Metrics from the whole repository</h2>");
      $('#selectString').html('<div>Click a sub-' + config.dataverseTerm + ' name to see its metrics</div>');
    } else {
      // Note that the subtitle is updated async via ajax
      $('#selectString').html('<div><a href= "' + window.location.href.split('?')[0] +'">Show Metrics for the whole repository</a></div><div>Click a sub-' + config.dataverseTerm + ' name to see its metrics</div>');
    }
    
    // Panels (sections)
    if(config.hasOwnProperty("downloadsHeader")) {
      $("#downloadSection").find(".metrics-section-title").text(config.downloadsHeader);
    }
    if(config.hasOwnProperty("makeDataCountHeader")) {
      $("#mdcSection").find(".metrics-section-title").text(config.makeDataCountHeader);
    }
    if(config.hasOwnProperty("holdingsHeader")) {
      $("#holdingsSection").find(".metrics-section-title").text(config.holdingsHeader);
    }
    
    // Footer
    if (config.hasOwnProperty("globalConfigured")) {
      if(config.globalConfigured === "true") {
        $("#global").html('<a href="/dataverse-metrics/global">View Aggregate Metrics from the Dataverse Community</a>'); 
      }
    }

    // Individual graphs

    // Downloads section
    // downloads/monthly - Over time
    if (!config.hasOwnProperty("timeseries.downloads") || config["timeseries.downloads"]) {
      timeseries("Downloads", config);
    } else {
       $("#downloads").parent().hide();
    }
    // uniquedownloads/monthly - Over time
    if (!config.hasOwnProperty("multitimeseries.uniquedownloads") || config["multitimeseries.uniquedownloads"]) {
      multitimeseries("UniqueDownloads", config, "pid");
    } else {
       $("#uniquedownloads").parent().hide();
    }
    // uniquedownloads (top)
    if (!config.hasOwnProperty("uniquedownloads") || config["uniquedownloads"]) {
      uniqueDownloads(config);
    } else {
      $("#uniquedownloads-by-pid").parent().hide();
    }
    // filedownloads (top)
    if (!config.hasOwnProperty("filedownloads") || config["filedownloads"]) {
      fileDownloads(config);
    } else {
      $("#filedownloads-by-id").parent().hide();
    }

    // Make Data Count (MDC) section
    if (!config.hasOwnProperty("makeDataCount") || config.makeDataCount) {
      // Over time
      makeDataCount("viewsTotal", config);
      makeDataCount("downloadsTotal", config);
      makeDataCount("viewsUnique", config);
      makeDataCount("downloadsUnique", config);
    } else {
      // No MDC
      $("#mdcSection").parent().hide();
    }

    // Holdings Section
    // datasets/monthly - Over time
    if (!config.hasOwnProperty("timeseries.datasets") || config["timeseries.datasets"]) {
      timeseries("Datasets", config);
    } else {
      $("#datasets").parent().hide();
    }
    // datasets/bySubject
    if (!config.hasOwnProperty("datasetsbysubject") || config["datasetsbysubject"]) {
      datasetsBySubject(config);
    } else {
      $("#datasets-by-subject").parent().hide();
    }
    // files/monthly - Over time
    if (!config.hasOwnProperty("timeseries.files") || config["timeseries.files"]) {
      timeseries("Files", config);
    } else {
      $("#files").parent().hide();
    }
    // files/byType, files-by-type-size - by Count and by Size graphs (2 graphs!)
    if (!config.hasOwnProperty("filesbytype") || config["filesbytype"]) {
      filesByType(config);
    } else {
      $("#files-by-type-count").parent().hide();
      $("#files-by-type-size").parent().hide();
    }
    // dataverses/monthly - Over time
    if (!config.hasOwnProperty("timeseries.dataverses") || config["timeseries.dataverses"]) {
      timeseries("Dataverses", config);
    } else {
      $("#dataverses").parent().hide();
    }
    // dataverse/bySubject
    if (!config.hasOwnProperty("dataversesbysubject") || config["dataversesbysubject"]) {
      dataversesBySubject(config);
    } else {
      $("#dataverses-by-subject").parent().hide();
    }
    // dataverse/byCategory
    if (!config.hasOwnProperty("dataversesbycategory") || config["dataversesbycategory"]) {
       dataversesByCategory(config);
    } else {
      $("#dataverses-by-category").parent().hide();
    }

  });
});

// Generic graph of time series - date versus count
function timeseries(name, config) {
  var lcname = name.toLowerCase();
  var nameLabel = name;
  var singular = lcname.substring(0, lcname.length -1);
  if(config.hasOwnProperty(singular + "Term")) {
    nameLabel = config[singular + "Term"] + "s";
  }
  var color = config["colors"][lcname + "/monthly"];
  var url = dvserver + '/api/info/metrics/' + lcname + '/monthly' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var yLabel = "Number of " + nameLabel;
      var visualization = new d3plus.BarChart()
        .data(data)
        .title(nameLabel)
        .select("#" + lcname)
        .groupBy("date")
        .x("date")
        .y("count")
        .xConfig({title: "Month"})
        .yConfig({title: yLabel})
        .time("date")
        .timeline(false) // Disable, but could do optional interactive timeline selection via config
        .tooltipConfig({
                         "tbody": [
                           [
                             "Count:",
                             function(d) { return d['count']; }
                           ]
                         ]
                       })

        .color(function(d) {
          return color;
        });
      visualization.render();
      if(config.hasOwnProperty("timeseries." + lcname + ".definition")) {
        var explain = config["timeseries." + lcname + ".definition"];
        appendExplanation(lcname, explain);
      }
    }
  });
  appendDownloadCSV(lcname, url);
}

function dataversesByCategory(config) {
  var colors = config["colors"]["dataverses/byCategory"];
  var url = dvserver + '/api/info/metrics/dataverses/byCategory' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var tileLabel = "Number of " + config.dataverseTerm + "s";
      var visualization = new d3plus.Treemap()
        .data(data)
        .title(config.dataverseTerm + "s by Category")
        .select("#dataverses-by-category")
        .groupBy("category")
        .sum("count")
        .legend(false);
      visualization.render();
      if(config.hasOwnProperty("dataversesbycategory.definition")) {
        var explain = config["dataversesbycategory.definition"];
        appendExplanation("dataverses-by-category", explain);
      }
    }
  });
  appendDownloadCSV("dataverses-by-category", url);
}

function dataversesBySubject(config) {
  var colors = config["colors"]["dataverses/bySubject"];
  var url = dvserver + '/api/info/metrics/dataverses/bySubject' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var tileLabel = "Number of " + config.dataverseTerm + "s";
      var visualization = new d3plus.Treemap()
        .data(data)
        .title(config.dataverseTerm + "s by Subject")
        .select("#dataverses-by-subject")
        .groupBy("subject")
        .sum("count")
        .legend(false);
      visualization.render();
      if(config.hasOwnProperty("dataversesbysubject.definition")) {
        var explain = config["dataversesbysubject.definition"];
        appendExplanation("dataverses-by-subject", explain);
      }
    }
  });
  appendDownloadCSV("dataverses-by-subject", url);
}

function datasetsBySubject(config) {
  var colors = config["colors"]["datasets/bySubject"];
  var url = dvserver + '/api/info/metrics/datasets/bySubject' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var tileLabel = "Number of " + config.Term;
      var visualization = new d3plus.Treemap()
        .data(data)
        .title(config.datasetTerm + " by Subject")
        .select("#datasets-by-subject")
        .groupBy("subject")
        .sum("count")
        .legend(false);
      visualization.render();
      if(config.hasOwnProperty("datasetsbysubject.definition")) {
        var explain = config["datasetsbysubject.definition"];
        appendExplanation("datasets-by-subject", explain);
      }
    }
  });
  appendDownloadCSV("datasets-by-subject", url);
}

// Retrieves any of the defined Make Data Count metrics
// (the graph itself is the same as other timeseries())
function makeDataCount(metric, config) {
  var color = config["colors"]["makeDataCount/" + metric + "/monthly"];
  var url = dvserver + '/api/info/metrics/makeDataCount/' + metric + '/monthly' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var yLabel = "Number of " + metric;
      var visualization = new d3plus.BarChart()
        .data(data)
        .title("Make Data Count Metrics-" + metric)
        .select("#makedatacount-" + metric)
        .groupBy("date")
        .x("date")
        .y("count")
        .xConfig({title: "Month"})
        .yConfig({title: yLabel})
        .color(function(d) {
          return color;
        });
      visualization.render();
      if(config.hasOwnProperty("makedatacount." + metric + ".definition")) {
        var explain = config["makedatacount." + metric + ".definition"];
        appendExplanation("makedatacount-" + metric, explain);
      }
    }
  });
  appendDownloadCSV("makedatacount-" + metric, url);
}

// Multitimeseries - an array of objects with an additional key that we groupby
// Used for uniquedownloads
function multitimeseries(name, config, groupby) {
  var lcname = name.toLowerCase();
  var color = config["colors"][lcname + "/monthly"];
  var url = dvserver + '/api/info/metrics/' + lcname + '/monthly' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var yLabel = "Number of " + name;
      var visualization = new d3plus.StackedArea() // BarChart() works, but StackedArea() or AreaPlot() looks weird
        .data(data)
        .title(name)
        .select("#" + lcname)
        //.stacked(true)
        .groupBy(groupby)
        .x("date")
        .y("count")
        .xConfig({title: "Month"})
        .yConfig({title: yLabel})
        .on("click", function(d) {
          // assuming groupby has a pid
          window.open(dvserver + "/dataset.xhtml?persistentId=" + d[groupby], target="_blank");
        })
        .time("date")
        .timeline(false) // Disable, but could do optional interactive timeline selection via config
        .legend(false);
      visualization.render();
      if(config.hasOwnProperty("multitimeseries." + lcname + ".definition")) {
        var explain = config["multitimeseries." + lcname + ".definition"];
        appendExplanation(lcname, explain);
      }
    }
  });
  appendDownloadCSV(lcname, url);
}

function filesByType(config) {
  var color = config["colors"]["files/byType"];
  var url = dvserver + '/api/info/metrics/files/byType' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var countVisualization = new d3plus.BarChart()
        .data(data)
        .title("File Count By Type")
        .select("#files-by-type-count")
        .groupBy("contenttype")
        .y("count")
        .x("contenttype")
        .xConfig({title: "Content Type"})
        .yConfig({title: "File Count"})
        .xSort(function(a,b) { return b["count"] - a["count"];})
        .tooltipConfig({
                         "tbody": [
                           [
                             "Count:",
                             function(d) { return d['count']; }
                           ]
                         ]
                       })
        .legend(false);
      countVisualization.render();
      if(config.hasOwnProperty("filesbytype.definition")) {
        var explain = config["filesbytype.definition"];
        appendExplanation("files-by-type-count", explain);
      }

      var sizeVisualization =  new d3plus.BarChart()
        .data(data.filter(d=>d.size > 0))
        .title("File Size By Type")
        .select("#files-by-type-size")
        .groupBy("contenttype")
        .x("contenttype")
        .y("size")
        .xConfig({title: "Content Type"})
        .yConfig({title: "Total Size By File Type"})
        .yConfig ({"scale": "log"})
        .yConfig({"gridLog": true}) // visual reminder of the log scale
        .xSort(function(a,b) { return b["size"] - a["size"];})
        .tooltipConfig({
                         "tbody": [
                           [
                             "Size:",
                             function(d) { return d3plus.formatAbbreviate(Math.abs(d['size'])); }
                           ]
                         ]
                       })
        .legend(false);
      sizeVisualization.render();
      if(config.hasOwnProperty("filesbytype.definition")) {
        var explain = config["filesbytype.definition"];
        appendExplanation("files-by-type-size", explain);
      }
    }
  });
  appendDownloadCSV("files-by-type-count", url);
  appendRedundantDownloadCSV("files-by-type-size", "These metrics are included in the CSV for the 'File Count By Type'");
}

// Shows the unique download count per PID
// The max number of elements (e.g. PIDs) to include can be controlled with the config.maxBars parameter
function uniqueDownloads(config) {
  var color = config["colors"]["downloads/unique"];
  var url = dvserver + '/api/info/metrics/uniquedownloads' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var title = "Unique Downloads per " + config.datasetTerm;
      var maxBars = config["maxBars"];
      if (typeof maxBars !== "undefined") {
        data = data.slice(0, maxBars);
        title = title + " (top " + maxBars + ")";
      }
      var xLabel = config.datasetTerm + " Identifier";
      var visualization = new d3plus.BarChart()
        .data(data)
        .title(title)
        .select("#uniquedownloads-by-pid")
        .groupBy("pid")
        .x("pid")
        .y("count")
        .xConfig({title: xLabel})
        .yConfig({title: "Unique Download Count"})
        // The API orders the results (so the slice gets the ones with the most counts), but the graph will reorder without this
        .xSort(function(a,b) { return b["count"] - a["count"];})
        .tooltipConfig({
                         "tbody": [
                           [
                             "Count:",
                             function(d) { return d['count']; }
                           ]
                         ]
                       })
        .on("click", function(d) {
          window.open(dvserver + "/dataset.xhtml?persistentId=" + d.pid, target="_blank");
        })
        .legend(false);
      visualization.render();
      if(config.hasOwnProperty("uniquedownloads.definition")) {
        var explain = config["uniquedownloads.definition"];
        appendExplanation("uniquedownloads-by-pid", explain);
      }
    }
  });
  appendDownloadCSV("uniquedownloads-by-pid", url);
}

// The max number of elements (e.g. PIDs) to include can be controlled with the config.maxBars parameter
function fileDownloads(config) {
  var color = config["colors"]["filedownloads/unique"];
  var url = dvserver + '/api/info/metrics/filedownloads' + addAlias();
  $.ajax({
    url: url,
    headers: { Accept: "application/json" },
    success: function(data) {
      data = data.data;
      var xName = "pid"; // prefer pid over id
      if(!data || !data.length || !data[0].hasOwnProperty("pid") || data[0].pid.length==0) {
        xName="id";
      }
      var title = "Downloads per DataFile";
      var maxBars = config["maxBars"];
      if (typeof maxBars !== "undefined") {
        data = data.slice(0, maxBars);
        title = title + " (top " + maxBars + ")";
      }
      var xLabel = config.datasetTerm + " Identifier";
      var visualization = new d3plus.BarChart()
        .data(data)
        .title(title)
        .select("#filedownloads-by-id")
        .groupBy(xName)
        .x(xName)
        .y("count")
        .xConfig({title: xLabel})
        .yConfig({title: "Download Count"})
        .tooltipConfig({
                         "tbody": [
                           [
                             "Count:",
                             function(d) { return d['count']; }
                           ]
                         ]
                       })
        .on("click", function(d) {
            if(!d.hasOwnProperty("pid") || d.pid.length==0) {
              window.open(dvserver + "/file.xhtml?fileId=" + d.id, target="_blank");
            } else {
              window.open(dvserver + "/file.xhtml?persistentId=" + d.pid, target="_blank");
            }
        })
        // The API orders the results (so the slice gets the ones with the most counts), but the graph will reorder without this
        .xSort(function(a,b) { return b["count"] - a["count"];});
      visualization.render();
      if(config.hasOwnProperty("filedownloads.definition")) {
        var explain = config["filedownloads.definition"];
        appendExplanation("filedownloads-by-id", explain);
      }
    }
  });
  appendDownloadCSV("filedownloads-by-id", url);
}

// Add the parentAlias param at the end of URLs if alias is set
function addAlias() {
  return ((alias === null) ? '' : '?parentAlias=' + alias);
}

// Turn dataverse names into links to the metrics page using that dataverse as the parent
function updateNames(node) {
  node.name = "<a href='" + window.location.href.split("?")[0] + "?parentAlias=" + node.alias + "'>" + node.name + "</a>";
  if (typeof node.children !== 'undefined') {
    node.children.forEach((childnode) => {
      updateNames(childnode);
    });
  }
}

function updateDisplayName(name, config) {
  if (alias != null) {
    $('#subtitle').hide();
    $('#subtitle').html("<h2>Showing Metrics from the " + name + " " + config.dataverseTerm + "</h2>");
    $('#subtitle').fadeIn("slow");
  }
}

function appendDownloadCSV(id, href) {
  $("#"+id).append($("<a/>").addClass("metrics-download-button").attr("href", href).attr("type", "text/csv")
    .text("CSV").attr("title", "Download CSV file")
    .prepend('<i class="fa fa-download" aria-hidden="true"></i>&nbsp;')
  );
}

function appendRedundantDownloadCSV(id, title) {
  $("#"+id).append($("<span/>").addClass("metrics-download-redundant").attr("title", title)
    .text("CSV")
    .append('&nbsp;').append($("<i/>").attr("aria-hidden", "true").addClass("fa fa-question-circle"))
  );
}

function appendExplanation(id, explain) {
  $("#"+id).after($("<div/>").addClass("viz-explain")
    .text(explain)
    .prepend('&nbsp;').prepend($("<i/>").attr("aria-hidden", "true").addClass("fa fa-info-circle"))
  );
}
