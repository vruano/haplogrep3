window.view = 'nuc';
window.maxMutations = 8;
window.gene = '';

window.table = $(".data-table").DataTable({
  pageLength: 50,
  lengthChange: false,
  fixedHeader: {
    headerOffset: $('#navigation').outerHeight()
  },
  ajax: {
    url: '{{routeUrl("jobs_download", {job: job.id, file: "clades.json"})}}',
    dataSrc: ''
  },
  "columns": [{
    "data": "sample"
  }, {
    "data": "clade"
  }, {
    "render": function(data, type, row) {
      return renderProgressBar(row.quality);
    }
  }, {
    "data": "ns"
  }, {
    "data": "coverage"
  }, {
    "data": "ranges",
    "render": function(data) {
      return data.length + ' ranges';
    }
  }, {
    "data": "annotatedPolymorphisms",
    "render": function(data) {
      return formatMutations(data, window.maxMutations, window.view, window.gene);
    }
  }]
});

$('.data-table tbody').on('click', 'tr', function() {

  var data = window.table.row(this).data();

  var dialog = bootbox.dialog({
    title: data.sample,
    onEscape: true,
    buttons: {
      close: {
        label: 'Close',
        className: 'btn-primary',
        callback: function() {

        }
      }
    },
    message: '<div style="height: 600px; overflow-y: scroll"><b>Haplogroup</b><br>' + data.clade + '<br><br>' +
      '<b>Quality</b><br>' + data.quality.toFixed(2) + '<br>'+ data.found + ' of ' + data.expected + ' mutations found<br><br>' +
      '<b>Other Hits:</b><br>' + formatHits(data) + ' <br>' +
      '<b>Ranges</b><br>' + formatRange(data.ranges) + '<br><br>' +
      '<b>Amino Acid Changes</b><br>' + formatMutations(data.annotatedPolymorphisms, 500, 'aac', '') + '<br><br>' +
      '<b>Nucleotide Changes</b><br>' + formatMutations(data.annotatedPolymorphisms, 500, 'nuc', '') + '<br><br>' +
      (data.expectedMutations.length > 0 ?
        ('<b>Expected Mutations by ' + data.clade + ' but not found</b><br>' + formatMutationsNotFound(data.expectedMutations, 'nuc') + '<br><br>') : '') +
      '</div>'
  });

  dialog.find("div.modal-dialog").addClass("modal-lg");

});


$('#amino_acid_changes').on('change', function() {
  if ($(this).is(":checked")) {
    window.view = 'aac';
  } else {
    window.view = 'nuc';
  }
  window.table.rows().invalidate().draw();
});


$('#show_all_mutations').on('change', function() {
  var value = $(this).val();
  if (value == '') {
    window.gene = '';
    window.maxMutations = 8;
  } else if (value == 'all') {
    window.gene = '';
    window.maxMutations = 500;
  } else {
    window.maxMutations = 500;
    window.gene = value;
  }
  window.table.rows().invalidate().draw();
})


function formatMutations(data, maxMutations, view, gene) {

  var result = '';
  for (var i = 0; i < data.length && i < maxMutations; i++) {
    var filtered = false;
    var label = view == 'aac' ? data[i].aac : data[i].nuc;
    if (gene != '') {
      if (data[i].aac == undefined || !data[i].aac.startsWith(gene)) {
        filtered = true;
      }
    }
    if (!filtered && label != undefined && label != '') {
      if (result != '') {
        result += ' ';
      }
      result += '<span class="badge ' + (data[i].found ? 'badge-success' : 'badge-info') + '">' + label + '</span>';
    }
  };
  if (data.length > maxMutations) {
    result += '<small class="text-muted"> and <b>' + (data.length - maxMutations) + '</b> more</small>';
  }
  return result;
}

function formatMutationsNotFound(data, view) {

  var result = '';
  for (var i = 0; i < data.length; i++) {
    var filtered = false;
    var label = view == 'aac' ? data[i].aac : data[i].nuc;

    if (label != undefined && label != '') {
      if (result != '') {
        result += ' ';
      }
      result += '<span class="badge badge-secondary">' + label + '</span>';
    }
  };
  return result;
}


function formatRange(data) {

  var result = '';
  for (var i = 0; i < data.length; i++) {
    var label = data[i].trim();
    if (label != undefined && label != '') {
      if (result != '') {
        result += ' ';
      }
      result += '<span class="badge badge-secondary">' + label + '</span>';
    }
  };
  return result;
}

function formatHits(data){

  var result = '<small><ol start="2" style="overflow-y: auto; height: 100px;">';
  for (var i = 0; i < data.otherClades.length; i++) {
      result += '<li>' + data.otherClades[i] +' (' + data.otherQualities[i].toFixed(2) + ')</li>';
  };
  result += "</ol></small>"
  return result;

}


function renderProgressBar(value) {
  var percentage = value * 100;
  return '<div class="progress" style="width: 60px;" title="Quality: ' + value.toFixed(2) + '">' +
    '<div class="progress-bar bg-success" role="progressbar" aria-valuenow="' + percentage + '" aria-valuemin="0" aria-valuemax="100" style="width: ' + percentage + '%">' +
    '<span class="sr-only">Quality: ' + value.toFixed(2) + '</span>' +
    '</div>' +
    '</div>';
}
