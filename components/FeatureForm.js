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
import { v4 } from "uuid";
import { createFeature, updateFeature } from "../src/graphql/mutations";
import { listFeatures } from "../src/graphql/queries";

import useSWRMutation from "swr/mutation";

function FeatureForm({ feature = null, setActiveFeature }) {
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isReleased, setReleased] = useState(false);
  const [internalDoc, setInternalDoc] = useState("");

  const { trigger: triggerSave } = useSWRMutation(
    listFeatures,
    handleSaveFeature
  );

  useEffect(() => {
    if (feature) {
      setId(feature.id);
      setTitle(feature.title);
      setDescription(feature.description);
      setReleased(feature.released);
      setInternalDoc(feature.internalDoc);
    }
  }, [feature]);

  async function handleUploadDoc(e) {
    const file = e.target.files[0];
    const fileName = `${Date.now()}-${file.name}`;
    try {
      await Storage.put(fileName, file, {
        contentType: file.type,
      });
      setInternalDoc(fileName);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function handleRemoveDoc() {
    try {
      await Storage.remove(internalDoc);
      setInternalDoc("");
    } catch (error) {
      console.log("Error removing file: ", error);
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
    const newId = v4();
    setId(newId);
    console.log("newId: ", newId);
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: feature ? updateFeature : createFeature,
        variables: {
          input: {
            //id: feature ? id : undefined,
            id: newId,
            title,
            description,
            released: isReleased,
            internalDoc: internalDoc,
          },
        },
      });

      feature && setActiveFeature(undefined);
      //resetFormFields();
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
      <Flex direction={"column"} basis={"max-content"}>
        <TextField
          value={title}
          label="Title"
          errorMessage="There is an error"
          name="title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <TextField
          value={description}
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
          <div>
            <Text>Attachment:</Text>
            <Text fontWeight={"bold"}>
              {internalDoc}{" "}
              <Button size="small" onClick={handleRemoveDoc}>
                X
              </Button>
            </Text>
          </div>
        ) : (
          <div>
            <Text>Upload a file:</Text>
            <input type="file" onChange={handleUploadDoc} />
          </div>
        )}

        <Flex marginTop="large">
          <Button
            onClick={() => {
              setActiveFeature(undefined);
              resetFormFields();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              triggerSave(undefined, {
                optimisticData: (current) => {
                  console.log("oD current: ", current);
                  const newFeature = {
                    id,
                    title,
                    description,
                    released: isReleased,
                    internalDoc: internalDoc,
                  };
                  resetFormFields();
                  return {
                    data: {
                      listFeatures: {
                        items: [
                          // @ts-ignore
                          ...current.data.listFeatures.items,
                          newFeature,
                        ],
                      },
                    },
                  };
                },
              });
            }}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    </View>
  );
}

export default FeatureForm;
