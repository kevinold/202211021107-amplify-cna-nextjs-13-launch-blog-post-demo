import {
  Button,
  Heading,
  SwitchField,
  Text,
  TextField,
  View,
} from "@aws-amplify/ui-react";
import { API, Storage } from "aws-amplify";
import React, { useState } from "react";
import { createFeature } from "../src/graphql/mutations";

function CreateFeatureForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isReleased, setReleased] = useState(false);
  const [internalDoc, setInternalDoc] = useState("");

  async function handleUpload(e) {
    const file = e.target.files[0];
    const fileName = `${Date.now()}-${file.name}`;
    try {
      const data = await Storage.put(fileName, file, {
        contentType: file.type,
      });
      setInternalDoc(fileName);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function handleCreateFeature() {
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createFeature,
        variables: {
          input: {
            title,
            description,
            released: isReleased,
            internalDoc: internalDoc,
          },
        },
      });

      setTitle("");
      setDescription("");
      setReleased(false);
      setInternalDoc("");
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  return (
    <View paddingTop="2rem" width={"50%"}>
      <Heading level={5}>New Feature</Heading>
      <form>
        <TextField
          label="Title"
          errorMessage="There is an error"
          name="title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          name="description"
          label="Description"
          errorMessage="There is an error"
          onChange={(e) => setDescription(e.target.value)}
        />

        <SwitchField
          isChecked={isReleased}
          isDisabled={false}
          label="Released?"
          labelPosition="start"
          onChange={() => setReleased(!isReleased)}
        />

        <br />

        <Text fontWeight={"bold"}>Upload a file:</Text>
        <input type="file" onChange={handleUpload} />

        <br />

        <Button marginTop="large" onClick={() => handleCreateFeature()}>
          Create Feature
        </Button>
      </form>
    </View>
  );
}

export default CreateFeatureForm;
