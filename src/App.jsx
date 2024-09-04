import { useEffect, useState } from "react";
import "./App.css";
import staticData from "./data/StaticTextData.json";
import dependencies from "./data/dependencies.json";
import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import fs from "fs";
import Grid from "@mui/material/Grid2";
import JSZip from "jszip";
import { CreateMvnFolder, CreatePackageFolder } from "./Helper/Helper";
import { CreateResourceFolder } from "./Helper/ResourceHelper";

function App() {
  const [projectname, setProjectname] = useState("");
  const [projectType, setProjectType] = useState("");
  const [mvnwFile, setMvnwFile] = useState("");
  const [mvnwCmdFile, setMvnwCmdFile] = useState("");

  const handleCreateButton = async () => {
    if (!projectname) {
      alert("Project name is required");
      return;
    }

    const fileContent = `Project Name: ${projectname}`;
    const zip = new JSZip();
    const srcFolder = zip.folder("src");

    const projectFolder = srcFolder.folder(projectname.toLowerCase());
    projectFolder.file("README.md", staticData.RootReadMe.content);

    const rsrqqFolder = projectFolder.folder(
      projectname.toLowerCase() + "_rsrq"
    );
    handleRsRQfolder(rsrqqFolder);

    const webhookFolder = projectFolder.folder(
      projectname.toLowerCase() + "_webhook"
    );

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectname}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchFileContent = async (path) => {
    const response = await fetch(path);
    const text = await response.text();
    return text;
  };

  useEffect(() => {
    const loadFileContent = async () => {
      setMvnwFile(await fetchFileContent("mvnw"));
      setMvnwCmdFile(await fetchFileContent("mvnw.cmd"));
    };

    loadFileContent();
  }, []);

  const handleRsRQfolder = async (rsrqqFolder) => {
    CreateMvnFolder(rsrqqFolder);
    createMvnWFile(rsrqqFolder);
    let mainFolder = rsrqqFolder.folder("main");
    CreatePackageFolder(mainFolder, projectname, "_rsrq");
    CreateResourceFolder(mainFolder, projectname);
  };

  const createMvnWFile = async (parentFolder) => {
    parentFolder.file("mvnw", mvnwFile);
    parentFolder.file("mvnw.cmd", mvnwCmdFile);
    return parentFolder;
  };

  return (
    <>
      <Container>
        <Grid container spacing={2}>
          <Grid size={8} container spacing={2}>
            <Grid size={8}>
              <TextField
                id="outlined-basic"
                fullWidth
                required
                label="Project Name"
                variant="outlined"
                value={projectname}
                onChange={(e) => setProjectname(e.target.value)}
              />
            </Grid>
            <Grid size={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateButton}
              >
                Create
              </Button>
            </Grid>
          </Grid>
          <Grid size={4}>
            {dependencies.dependencies.map((dependency, index) => (
              <div key={index}>
                <FormControlLabel
                  control={<Checkbox checked />}
                  label={dependency.name}
                />
              </div>
            ))}
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;
