import {
  Button,
  Flex,
  Heading,
  SwitchField,
  Text,
  TextField,
  View,
} from "@aws-amplify/ui-react";
import { API, Storage } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { createFeature, updateFeature } from "../src/graphql/mutations";
import StorageImage from "./StorageImage";

function FeatureForm({ feature = null, setActiveFeature }) {
  const [id, setId] = useState(undefined);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isReleased, setReleased] = useState(false);
  const [internalDoc, setInternalDoc] = useState("");

  useEffect(() => {
    if (feature) {
      setId(feature.id);
      setTitle(feature.title);
      setDescription(feature.description);
      setReleased(feature.released);
      setInternalDoc(feature.internalDoc);
    }
  }, [feature]);

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

  function resetFormFields() {
    setId(undefined);
    setTitle("");
    setDescription("");
    setReleased(false);
    setInternalDoc("");
  }

  async function handleSaveFeature() {
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: feature ? updateFeature : createFeature,
        variables: {
          input: {
            id: feature ? id : undefined,
            title,
            description,
            released: isReleased,
            internalDoc: internalDoc,
          },
        },
      });

      feature && setActiveFeature(undefined);
      resetFormFields();
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  return (
    <View>
      <Heading marginBottom="medium" level={5}>
        {feature ? "Edit" : "New"} Feature
      </Heading>
      <Flex direction={"column"}>
        <TextField
          defaultValue={title}
          label="Title"
          errorMessage="There is an error"
          name="title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          defaultValue={description}
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

        {feature && internalDoc ? (
          <StorageImage image={internalDoc} />
        ) : (
          <div>
            <Text fontWeight={"bold"}>Upload a file:</Text>
            <input type="file" onChange={handleUpload} />
          </div>
        )}

        <Button marginTop="large" onClick={() => handleSaveFeature()}>
          Save
        </Button>
      </Flex>
    </View>
  );
}

export default FeatureForm;
