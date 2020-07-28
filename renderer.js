/*
Lynette Gasper,
R. Johnson,
Thomas Straub,
Cassy Baker,
Karen Heins,
Brianna Kaiser,
Emily Newman,
Janice Coleman-Mathus,
Justus Pickett,
Meredith Brandon,
Stephanie Bruning,
Janie Johnston,
sandra rideout,
Jodie Harnden,
Jill Scheurer,
Ellen Brenneman,
Emily Rathmell,
Melani Sailer,
Steve Roth,
Melinda Turner,
Monica Gulczynski,
Heidi Lux,
Ms. Cheung,
Rebecca Colo,
Julie Hunter,
Stephanie Harmon,
Tabitha Maillet,
Christine Connolly,
Debbie Nelson
*/

let teacherList;
let data = [];
let dataPath = "";
let mergedData;

$("#Step2Container").hide();
$("#Step3Container").hide();
$("#Step4Container").hide();
$("#Step5Container").hide();


$("#Step1").on("click", () => {
    dataPath = selectDataDirectory();
    console.log("Selected Data Directory: " + dataPath);
    $("#Step1Log").html("Selected Data Folder: " + dataPath + "<br>Done!<br>");
    $("#Step2Container").show(500, () => {
        $("html, body").animate({ scrollTop: $(document).height() }, 250);
    });
});


$("#Step2").on("click", () => {
    const files = getFiles(dataPath);
    $("#Step2Log").html("Selected Data Folder: " + dataPath + "<br>");

    data = [];
    for(let i = 0; i < files.length; i++) {
        const filePath = dataPath + "/" + files[i];
        $("#Step2Log").append("Found file: " + filePath + "<br>");
        setTimeout(() => {
            data.push(readFile(filePath));

            if(data.length >= files.length) {
                console.log(data);
                $("#Step2Log").append("Done!<br>");
                $("#Step3Container").show(500, () => {
                    $("html, body").animate({ scrollTop: $(document).height() }, 250);
                });
            }
        }, 0);
    }
    $("#Step2Log").append("Reading all files. This may take several minutes...<br>");

});


$("#Step3").on("click", () => {
    populateTeacherList();

    //Check if all teachers exist
    const checkSet = new Set();
    data.forEach(file => {
        file.forEach(sheet => {
            if(sheet.data.length >= 1) {
                //Determine the column that the teacher's name is kept in because for some reason this data
                //doesn't contain a unique teacher id or have any consistency between spreadsheets which column
                // the teacher's name ends up in
                const teacherColumnIndex = sheet.data[1].indexOf("Teachers"); // I don't like that I have to do this
                sheet.data.forEach(student => {
                    if(teacherList.has(student[teacherColumnIndex]?.toLowerCase())) {
                        checkSet.add(student[teacherColumnIndex].toLowerCase());
                    }
                });
            }
        });
    });

    console.log(checkSet);
    teacherList.forEach(value => {
        if(!checkSet.has(value.toLowerCase())) {
            $("#Step3Log").append("WARNING: Could not find teacher: " + value + " in data<br>");
        }
    });

    $("#Step3Log").append("Done!<br>");
    $("#Step4Container").show(500, () => {
        $("html, body").animate({ scrollTop: $(document).height() }, 250);
    });
});


$("#Step4").on("click", () => {
    mergedData = filterData(data, teacherList);
    $("#Step4Log").html("Done!<br>");
    $("#Step5Container").show(500, () => {
        $("html, body").animate({ scrollTop: $(document).height() }, 250);
    });
});


$("#Step5").on("click", () => {
    const path = selectSavePath();
    $("#Step5Log").html("Selected Export Path: " + path);
    saveData(mergedData, path);
    $("#Step5Log").append("<br>Done!<br>");

});

$("#MergeButton").on("click", () => {
    populateTeacherList();
    const mergedData = filterData(data, teacherList);
    saveData(mergedData);
});

$("#DataButton").on("click", (event) => {
    const dataPath = selectDataDirectory(); 
    console.log(dataPath);
    data = readFiles(dataPath);
    console.log(data);
});

function populateTeacherList() {
    teacherList = new Set($("#TeacherList").val().replace(/[\t\n\r]/g, "").split(',').map(value => {return value.toLowerCase()}));
    console.log(teacherList);
}