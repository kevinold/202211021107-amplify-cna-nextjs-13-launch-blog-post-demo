import {
  Button,
  Heading,
  SwitchField,
  Text,
  TextField,
  View,
} from "@aws-amplify/ui-react";
import { API, Storage } from "aws-amplify";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createFeature } from "../src/graphql/mutations";

function CreateFeatureForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isReleased, setReleased] = useState(false);
  const [imageFilename, setImageFilename] = useState("");

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    const fileName = Date.now() + ".jpg";
    try {
      const data = await Storage.put(fileName, file, {
        contentType: "image/jpg",
        cacheControl: "max-age=31536000",
      });
      console.log("file data", data);
      setImageFilename(fileName);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function handleCreateFeature() {
    try {
      const { data } = await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: createFeature,
        variables: {
          input: {
            title,
            description,
            released: isReleased,
            internalDoc: imageFilename,
          },
        },
      });

      setTitle("");
      setDescription("");
      setImageFilename("");
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  function StorageImage({ image }) {
    console.log("image", image);
    const [signedUrl, setSignedUrl] = useState("");
    useEffect(() => {
      const fetchSignedUrl = async () => {
        const result = await Storage.get(image);
        console.log("key: ", image);
        console.log("result: ", result);
        setSignedUrl(result);
      };

      fetchSignedUrl();
    }, [image]);

    if (signedUrl) {
      return <Image src={signedUrl} alt="image" width={50} height={50} />;
    }
    return <></>;
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

        <Text fontWeight={"bold"}>Upload and image:</Text>

        <input type="file" accept="image/jpg" onChange={handleImageUpload} />

        <br />

        <Button marginTop="large" onClick={() => handleCreateFeature()}>
          Create Feature
        </Button>
      </form>
    </View>
  );
}

export default CreateFeatureForm;
