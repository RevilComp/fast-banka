$(document).ready(function () {
  //Only needed for the filename of export files.
  //Normally set in the title tag of your page.
  document.title = "Banka Hesapları | Admin Panel";
  // DataTable initialisation

  setTimeout(function () {
    /* = NOTE : don't add "id" in <table> if not necessary, is added than replace each "id" here = */
    $(".display").DataTable({
      responsive: true,
    });
    /* =========================================================================================== */
    /* ============================ BOOTSTRAP 3/4 EVENT ========================================== */
    $('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
      $($.fn.dataTable.tables(true))
        .DataTable()
        .columns.adjust()
        .responsive.recalc();
    });
    /* =========================================================================================== */

    $("#example").DataTable({
      dom: '<"dt-buttons"Bf><"clear">lirtp',
      paging: true,
      autoWidth: true,
      columnDefs: [{ orderable: false, targets: 5 }],
      order: [[1, "desc"]],
      buttons: [
        "colvis",
        "copyHtml5",
        "csvHtml5",
        "excelHtml5",
        "pdfHtml5",
        "print",
      ],
    });

    $("#example1").DataTable({
      dom: '<"dt-buttons"Bf><"clear">lirtp',
      paging: true,
      autoWidth: true,
      columnDefs: [{ orderable: false, targets: 5 }],
      buttons: [
        "colvis",
        "copyHtml5",
        "csvHtml5",
        "excelHtml5",
        "pdfHtml5",
        "print",
      ],
    });

    $("#example2").DataTable({
      dom: '<"dt-buttons"Bf><"clear">lirtp',
      paging: true,
      autoWidth: true,
      columnDefs: [{ orderable: false, targets: 5 }],
      buttons: [
        "colvis",
        "copyHtml5",
        "csvHtml5",
        "excelHtml5",
        "pdfHtml5",
        "print",
      ],
    });

    $("#example3").DataTable({
      dom: '<"dt-buttons"Bf><"clear">lirtp',
      paging: true,
      autoWidth: true,
      columnDefs: [{ orderable: false, targets: 5 }],
      buttons: [
        "colvis",
        "copyHtml5",
        "csvHtml5",
        "excelHtml5",
        "pdfHtml5",
        "print",
      ],
    });

    $("#example4").DataTable({
      dom: '<"dt-buttons"Bf><"clear">lirtp',
      paging: true,
      autoWidth: true,
      columnDefs: [{ orderable: false, targets: 5 }],
      buttons: [
        "colvis",
        "copyHtml5",
        "csvHtml5",
        "excelHtml5",
        "pdfHtml5",
        "print",
      ],
    });

    //Delete buttons
    $(".dt-delete").each(function () {
      $(this).on("click", function (evt) {
        $this = $(this);
        var dtRow = $this.parents("tr");
        if (confirm("Are you sure to delete this row?")) {
          var table = $("#example").DataTable();
          table
            .row(dtRow[0].rowIndex - 1)
            .remove()
            .draw(false);
        }
      });
    });
    $("#myModal").on("hidden.bs.modal", function (evt) {
      $(".modal .modal-body").empty();
    });
  }, 1000);
});
