// This file is responsible for all of the heavy lifting of the application.
// It's functions are called from renderer.js
// This file has access to node packages

const { readdirSync, writeFileSync } = require('fs');
const { dialog } = require('electron').remote;
const xlsx = require('node-xlsx');
const Enumerable = require('linq');
const { shell } = require('electron');

// Opens OS specific "Open" dialogue which accepts folders as inputs and
// returns the selected directory path
window.selectDataDirectory = function() {
    return dialog.showOpenDialogSync(options = {
        properties: [
            "openDirectory"
        ]
    })[0];
}

// Returns array of paths for all files within given directory
window.getFiles = function (path) {
    const files = readdirSync(path);
    return files;
}

// Reads Excel file into arrays using node-xlsx package
window.readFile = function (filePath) {
    console.log("Reading file: " + filePath);
    return (xlsx.parse(filePath));
}

// Merges all data and filters based on given teacher list
window.filterData = function (data, teacherList) {
    const filteredData = [];
    // Assume Student ID numbers are always the first column
    const studentIDColumn = 0;

    data.forEach(file => {
        const fileData = [];
        file.forEach(sheet => {
            if(sheet.data.length >= 1) {
                // Determine the column that the teacher's name is kept in because this data doesn't contain a unique teacher id
                const teacherColumnIndex = sheet.data[1].indexOf("Teachers"); // I don't like that I have to do this
                const labels = [];
                //Assume the first three rows are labels
                labels.push(sheet.data[0]);
                labels.push(sheet.data[1]);
                labels.push(sheet.data[2]);
                // Add label rows and all rows that match a name in the teacher list
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
                if(isNaN(student[studentIDColumn]) || student[studentIDColumn] === "")
                    return;
                
                if(mergedData.has(student[studentIDColumn])) { // Student ID has already been found in previous file
                    if(mergedData.get(student[studentIDColumn]).length > maxIndex) { // If duplicate Student ID in the same file found
                        //Duplicate set of data
                        if(mergedData.has(student[studentIDColumn] + "-DUPLICATE")) { // If duplicate already exists, add additional data to that row
                            mergedData.set(student[studentIDColumn] + "-DUPLICATE", mergedData.get(student[studentIDColumn] + "-DUPLICATE").concat(student));
                        } else { // Else create new row
                            student[studentIDColumn] += "-DUPLICATE";
                            
                            // If not first data sheet, pad data with empty values
                            if(maxIndex > 0) {
                                const rowData = [];
                                for(let i = 0; i < maxIndex; i++) {
                                    rowData.push("");
                                }
                                mergedData.set(student[studentIDColumn] + "-DUPLICATE", rowData.concat(student));
                            } else {
                                mergedData.set(student[studentIDColumn] + "-DUPLICATE", student);
                            }
                        }
                    } else { // Concat new student data to existing data
                        mergedData.set(student[studentIDColumn], mergedData.get(student[studentIDColumn]).concat(student));
                    }
                } else { // First time finding Student ID
                    if(maxIndex > 0) { // If not first sheet, pad row with empty data
                        const rowData = [];
                        for(let i = 0; i < maxIndex; i++) {
                            rowData.push("");
                        }
                        mergedData.set(student[studentIDColumn], rowData);
                    } else {
                        mergedData.set(student[studentIDColumn], student);
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

// Opens OS specific "Save" dialogue which accepts a name as input and
// returns the selected file path
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

// Converts data to .xlsx file and saves it to a file at the given path
window.saveData = function(mergedData, path) {
    console.log(mergedData);
    
    // Convert data back to an .xlsx Excel file
    let buffer = xlsx.build([{name: "Merged Data", data: mergedData}]);
    // Write data to path
    writeFileSync(path, buffer);
    // Use Electron to highlight the newly saved file in the explorer
    shell.showItemInFolder(path);
}