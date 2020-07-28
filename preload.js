const { readFileSync, readdirSync, writeFileSync } = require('fs');
const { dialog } = require('electron').remote;
const xlsx = require('node-xlsx');
const Enumerable = require('linq');
const { shell } = require('electron');

window.selectDataDirectory = function() {
    return dialog.showOpenDialogSync(options = {
        properties: [
            "openDirectory"
        ]
    })[0];
}

window.getFiles = function (path) {
    const files = readdirSync(path);
    return files;
}

window.readFile = function (filePath) {
    console.log("Reading file: " + filePath);
    return (xlsx.parse(filePath));
}

window.filterData = function (data, teacherList) {
    const filteredData = [];

    data.forEach(file => {
        const fileData = [];
        file.forEach(sheet => {
            if(sheet.data.length >= 1) {
                //Determine the column that the teacher's name is kept in because for some reason this data
                //doesn't contain a unique teacher id or have any consistency between spreadsheets which column
                // the teacher's name ends up in
                const teacherColumnIndex = sheet.data[1].indexOf("Teachers"); // I don't like that I have to do this
                const labels = []; //sheet.data[0].concat(sheet.data[1].concat(sheet.data[2]));
                //Assume the first three rows are labels
                labels.push(sheet.data[0]);
                labels.push(sheet.data[1]);
                labels.push(sheet.data[2]);
                fileData.push(labels.concat(Enumerable.from(sheet.data).where(e => teacherList.has(e[teacherColumnIndex]?.toLowerCase())).toArray()));    
            }
        });
        filteredData.push(fileData);
    });
    console.log(filteredData);

    const mergedData = new Map();
    let maxIndex = 0;
    filteredData.forEach(file => {
        file.forEach(sheet => {
            //Assume the first three rows are labels
            mergedData.set("label1", mergedData.has("label1") ? mergedData.get("label1").concat(sheet[0]) : sheet[0]);
            mergedData.set("label2", mergedData.has("label2") ? mergedData.get("label2").concat(sheet[1]) : sheet[1]);
            mergedData.set("label3", mergedData.has("label3") ? mergedData.get("label3").concat(sheet[2]) : sheet[2]);
            sheet.forEach(student => {
                // Ignore rows without Student ID numbers
                // Assume Student ID numbers are always the first column
                if(isNaN(student[0]) || student[0] === "")
                    return;
                
                if(mergedData.has(student[0])) { // Student ID has already been found in previous file
                    if(mergedData.get(student[0]).length > maxIndex) { // If duplicate Student ID in the same file found
                        //Duplicate set of data
                        if(mergedData.has(student[0] + "-DUPLICATE")) {
                            mergedData.set(student[0] + "-DUPLICATE", mergedData.get(student[0] + "-DUPLICATE").concat(student));

                        } else {
                            student[0] += "-DUPLICATE";
                            if(maxIndex > 0) {
                                const rowData = [];
                                for(let i = 0; i < maxIndex; i++) {
                                    rowData.push("");
                                }
                                mergedData.set(student[0] + "-DUPLICATE", rowData.concat(student));
                            } else {
                                mergedData.set(student[0] + "-DUPLICATE", student);
                            }
                        }
                        

                    } else { // Concat new student data to existing data
                        mergedData.set(student[0], mergedData.get(student[0]).concat(student));
                    }
                } else { // First time finding Student ID
                    if(maxIndex > 0) { // If not first file, pad row with empty data
                        const rowData = [];
                        for(let i = 0; i < maxIndex; i++) {
                            rowData.push("");
                        }
                        mergedData.set(student[0], rowData);
                    } else {
                        mergedData.set(student[0], student);
                    }
                    
                }
            });
            // Index used to keep track of expected length of rows
            maxIndex += sheet[0].length;

            // If data was not found in the file pad it with empty data
            mergedData.forEach(value => {
                while(value.length < maxIndex) {
                    value.push("");
                }
            });
        });
    });



    console.log(mergedData);
    return Array.from(mergedData.values());
}

window.selectSavePath = function() {
    // Use Electron to get save path
    const path = dialog.showSaveDialogSync(options= {
        title: "Save Merged Data to .xlsx",
        filters: [{
            name: "Excel",
            extensions: ["xlsx"]
        }]
    });
    console.log("Saving to: " + path);
    return path;
}

window.saveData = function(mergedData, path) {
    console.log(mergedData);
    
    // Convert data back to an .xlsx Excel file
    let buffer = xlsx.build([{name: "Merged Data", data: mergedData}]);
    // Write data to path
    writeFileSync(path, buffer);
    // Use Electron to highlight the newly saved file in the explorer
    shell.showItemInFolder(path);
}