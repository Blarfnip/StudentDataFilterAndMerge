// This is the user facing code. Responsible for listening to button clicks and updating UI
// This file has access to jQuery

let teacherList; // List of teachers to filter
let data = []; // Raw input data from .xlsx files
let dataPath = ""; // Path of data folder
let mergedData; // Output filtered and merged data
let mergeAllData = false; // Filter based on teacher names or not

// Hide later steps by default
$("#Step2Container").hide();
$("#Step3Container").hide();
$("#Step4Container").hide();
$("#Step5Container").hide();

// Step 1 asks the user to select the directory where the data is stored
$("#Step1").on("click", () => {
    dataPath = selectDataDirectory();
    console.log("Selected Data Directory: " + dataPath);
    $("#Step1Log").html("Selected Data Folder: " + dataPath + "<br>Done!<br>");
    $("#Step2Container").show(500, () => {
        $("html, body").animate({ scrollTop: $(document).height() }, 250);
    });
});

// Step 2 reads all of the data from the dataPath into the program
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

// Step 3 asks the user to input teacher names separated by commas
$("#Step3").on("click", () => {
    populateTeacherList();

    //Check if all teachers exist
    const checkSet = new Set();
    data.forEach(file => {
        file.forEach(sheet => {
            if(sheet.data.length >= 1) {
                //Determine the column that the teacher's name is kept in because this data
                //doesn't contain a unique teacher id
                const teacherColumnIndex = sheet.data[1].indexOf("Teachers"); // I don't like that I have to do this
                sheet.data.forEach(student => {
                    // Teacher names are not case sensative but punctuation and whitespace does matter
                    if(teacherList.has(student[teacherColumnIndex]?.toLowerCase())) {
                        checkSet.add(student[teacherColumnIndex].toLowerCase());
                    }
                });
            }
        });
    });

    // Outputs warning if input teachers are not found within the data set
    console.log(checkSet);
    teacherList.forEach(value => {
        if(!checkSet.has(value.toLowerCase())) {
            $("#Step3Log").append("WARNING: Could not find teacher: " + value + " in data<br>");
        }
    });

    mergeAllData = false;
    console.log(teacherList.size);
    if(teacherList.size <= 1) {
        teacherList.forEach(value => {
            console.log(value.size);
            if(value.length <= 0) {
                $("#Step3Log").append("No teachers found. Defualting to merge all data.<br>");
                mergeAllData = true;
            }
        });
    }
    console.log(mergeAllData);

    $("#Step3Log").append("Done!<br>");
    $("#Step4Container").show(500, () => {
        $("html, body").animate({ scrollTop: $(document).height() }, 250);
    });
});

// Step 4 filters and merges all of the data
$("#Step4").on("click", () => {
    mergedData = filterData(data, teacherList, mergeAllData);
    $("#Step4Log").html("Done!<br>");
    $("#Step5Container").show(500, () => {
        $("html, body").animate({ scrollTop: $(document).height() }, 250);
    });
});

// Step 5 asks the user to select a path to save the merged data to
$("#Step5").on("click", () => {
    const path = selectSavePath();
    $("#Step5Log").html("Selected Export Path: " + path);
    saveData(mergedData, path);
    $("#Step5Log").append("<br>Done!<br>");

});

// Reads teacher list and populates teacherList with filtered values
function populateTeacherList() {
    // Teacher names are split based on commas and certain empty spaces are removed using regex. Comparison is not case sensitive
    teacherList = new Set($("#TeacherList").val().replace(/[\t\n\r]/g, "").split(',').map(value => {return value.toLowerCase()}));
    console.log(teacherList);
}