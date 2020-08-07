# Student Data Merge Tool
#### Developed for Concord Consortium by Saul Amster
This tool was built to handle automatically filtering and merging student data exported by Concord Consortium applications.  
It can merge multiple .xlsx files into a single file and filter out any unwanted teachers. The process is done through an easy to use GUI built using the Electron library.

## Installation
[Current Release](https://github.com/Blarfnip/StudentDataFilterAndMerge/releases/)
### Mac
Download the ".dmg" file from the most recent release and run the file to install. Follow the instructions to add the tool to the Applications folder.  
  
In order to open the tool, right click on the icon in the Applications folder and select "Open" then follow the prompts to allow the tool to run.
### Windows
Download the ".exe" file from the most recent release and run the file to install.  
  
The installer will create a shortcut on the desktop, it can be opened the same way as any other application.
  
  
## Development
This tool is built using the Electron library to create simple cross platform standalone applications. 
### Development Setup
1. Clone the repository to a local folder
2. ``cd`` to the repository folder and run ``npm install``
3. Use ``npm start`` to run the development build
### Building the Tool
Use ``npm run dist`` to build the application. The output can be found in the "/dist" folder
