import {
  Button,
  Flex,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  View,
} from "@aws-amplify/ui-react";
import { API, graphqlOperation, Storage } from "aws-amplify";
import React, { useEffect, useState } from "react";
import { deleteFeature } from "../src/graphql/mutations";
import { listFeatures } from "../src/graphql/queries";
import {
  onCreateFeature,
  onDeleteFeature,
  onUpdateFeature,
} from "../src/graphql/subscriptions";

function FeaturesTable({ initialFeatures = [], setActiveFeature }) {
  const [features, setFeatures] = useState(initialFeatures);

  useEffect(() => {
    const fetchFeatures = async () => {
      const result = await API.graphql(graphqlOperation(listFeatures));
      setFeatures(result.data.listFeatures.items);
    };

    fetchFeatures();
    const createSub = API.graphql(graphqlOperation(onCreateFeature)).subscribe({
      next: ({ value }) => {
        setFeatures((features) => [...features, value.data.onCreateFeature]);
      },
    });

    const updateSub = API.graphql(graphqlOperation(onUpdateFeature)).subscribe({
      next: ({ value }) => {
        setFeatures((features) => {
          const toUpdateIndex = features.findIndex(
            (item) => item.id === value.data.onUpdateFeature.id
          );
          if (toUpdateIndex === -1) {
            return [...features, value.data.onUpdateFeature];
          }
          return [
            ...features.slice(0, toUpdateIndex),
            value.data.onUpdateFeature,
            ...features.slice(toUpdateIndex + 1),
          ];
        });
      },
    });

    const deleteSub = API.graphql(graphqlOperation(onDeleteFeature)).subscribe({
      next: ({ value }) => {
        setFeatures((features) => {
          const toDeleteIndex = features.findIndex(
            (item) => item.id === value.data.onDeleteFeature.id
          );
          return [
            ...features.slice(0, toDeleteIndex),
            ...features.slice(toDeleteIndex + 1),
          ];
        });
      },
    });

    return () => {
      createSub.unsubscribe();
      updateSub.unsubscribe();
      deleteSub.unsubscribe();
    };
  }, []);

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "download";
    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener("click", clickHandler);
      }, 150);
    };
    a.addEventListener("click", clickHandler, false);
    a.click();
    return a;
  }

  async function handleDownload(fileKey) {
    const result = await Storage.get(fileKey, { download: true });
    downloadBlob(result.Body, fileKey);
  }

  async function onDeleteInternalDoc(internalDoc) {
    try {
      await Storage.remove(internalDoc);
    } catch ({ errors }) {
      console.error(...errors);
    }
  }

  async function handleDeleteFeature(id) {
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: deleteFeature,
        variables: {
          input: {
            id,
          },
        },
      });
    } catch ({ errors }) {
      console.error(...errors);
    }
  }

  if (features.length === 0) {
    return <View>No features</View>;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell as="th">Feature</TableCell>
          <TableCell as="th">Released</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {features.map((feature) => (
          <TableRow key={feature.id}>
            <TableCell>{feature.title}</TableCell>
            <TableCell>{feature.released ? "Yes" : "No"}</TableCell>
            <TableCell>
              <Flex>
                <Button size="small" onClick={() => setActiveFeature(feature)}>
                  Edit
                </Button>
                <Button
                  size="small"
                  onClick={async () =>
                    await Promise.all([
                      // delete the document via Storage
                      onDeleteInternalDoc(feature.internalDoc),
                      handleDeleteFeature(feature.id),
                    ])
                  }
                >
                  Delete
                </Button>
                {feature.internalDoc ? (
                  <Button
                    size="small"
                    onClick={() => handleDownload(feature.internalDoc)}
                  >
                    Download File
                  </Button>
                ) : undefined}
              </Flex>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default FeaturesTable;
