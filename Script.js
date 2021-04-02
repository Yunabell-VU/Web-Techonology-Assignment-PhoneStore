$(document).ready(function () {
    //Task 1: Sorting 
    //reference: https://cdnjs.com/libraries/jquery.tablesorter
    //https://mottie.github.io/tablesorter/docs/index.html
    $(function () {
        //both dynamic table and static don't need the first and third column to be sorted
        $.tablesorter.defaults.headers = { 0: { sorter: false }, 2: { sorter: false } };

        //sorting for static table
        $("#salesTable").tablesorter({
        });

        //sorting for dynamic table
        $("#topsellingTable").tablesorter({
            usNumberFormat: true,
            sortReset: false,
            sortRestart: true
        });
    });

    //Check what's in database (for testing and debugging)
    function loadMessage() {
        $(this).html("loading...");
        var obj = this;
        $.ajax({
            url: "http://localhost:3000/list",
            dataType: "html",
            success: function (result) {
                $(obj).html(result);
            }
        });
    }
    loadMessage.call($("#addinfo"));

    //Task 3: Ajax Get Json data from Database and convert Json data into object type variable
    //insert new object into DOM
    //reference: https://api.jquery.com/jQuery.getJSON/#jQuery-getJSON-url-data-success
    function updateTable() {
        $.getJSON("http://localhost:3000/list", function (data) {
            $(".tableContent").remove();
            $.each(data, function (key, val) {
                var $tr = $("<tr class='tableContent'><td>" + "<img src=" + val.image + 
                " alt='phone_image'/>" + "</td><td>" + val.brand + "</td><td>" + val.model + 
                "</td><td>" + val.os + "</td><td>" + val.screensize + "</td></tr>");
                $($tr).insertBefore("#formInput");

                $("table").trigger("update");
            });
        });
    }
    updateTable();

    //Reset Database (Task 2)
    $("#ajaxReset").click(function () {
        $.ajax({
            type: "get",
            url: "http://localhost:3000/reset",
            success: function (data) {
                alert("Succesfully reset database!");
            }
        })
        loadMessage.call($("#addinfo"));
        updateTable();
    });

    //Post form input to database (Task 4)
    //reference: https://api.jquery.com/jQuery.post/
    $("#ajaxSubmit").click(function () {
        postData();
    });
    function postData() {
        $("#bestSells").submit(function (event) {
            event.preventDefault();
            var $form = $(this),
                url = $form.attr("action");
            // Send the data using post
            /*   $.post(url, {brand: brand, model: model, os: os, image: image,screensize: screensize});*/
            if ($form.find("input[name='image']").val() != "") {
                $.ajax({
                    url: url,
                    dataType: "jason",
                    method: "POST",
                    data: $('#bestSells').serialize(),
                    //data: { brand: brand, model: model, os: os, image: image, screensize: screensize },
                    success: function (result) {
                        console.log("Data submitted.")
                    },
                })
            };

            updateTable();
            loadMessage.call($("#addinfo"));

            //Clear form input content
            $($form.find("input[name='image']")).val("");
            $($form.find("input[name='brand']")).val("");
            $($form.find("input[name='model']")).val("");
            $($form.find("input[name='os']")).val("");
            $($form.find("input[name='screensize']")).val("");
        });
    };

    //Display current date (caption of dynamic table)
    //reference: zybook Chapter6.9: Date object
    $(function () {
        var myDate = new Date;
        var year = myDate.getFullYear();
        var mon = myDate.getMonth() + 1;
        var date = myDate.getDate();
        var week = myDate.getDay();
        var weeks = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        $("#current_time").html("<caption>" + year + "-" + mon + "-" + date + " " + weeks[week] + "</caption>");
    })
});


