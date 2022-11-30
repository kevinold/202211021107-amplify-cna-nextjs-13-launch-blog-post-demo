import {
  Button,
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
import { onCreateFeature, onDeleteFeature } from "../src/graphql/subscriptions";
import StorageImage from "./StorageImage";

function FeaturesTable({ serverFeatures = [], setActiveFeature }) {
  const [features, setFeatures] = useState(serverFeatures);

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

    /*
    const updateSub = API.graphql(graphqlOperation(onUpdateTodo)).subscribe({
      next: ({ value }) => {
        setTodos(todos => {
          const toUpdateIndex = todos.findIndex(item => item.id === value.data.onUpdateTodo.id)
          if (toUpdateIndex === - 1) { // If the todo doesn't exist, treat it like an "add"
            return [...todos, value.data.onUpdateTodo]
          }
          return [...todos.slice(0, toUpdateIndex), value.data.onUpdateTodo, ...todos.slice(toUpdateIndex + 1)]
        })
      }
    })
    */

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
      deleteSub.unsubscribe();
    };
  }, []);

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
          <TableCell>Feature</TableCell>
          <TableCell>Released</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {features.map((feature) => (
          <TableRow key={feature.id}>
            <TableCell>{feature.title}</TableCell>
            <TableCell>{feature.released ? "Yes" : "No"}</TableCell>
            <TableCell>
              {feature.internalDoc ? (
                <StorageImage image={feature.internalDoc} />
              ) : undefined}
            </TableCell>
            <TableCell>
              <Button size="small" onClick={() => setActiveFeature(feature)}>
                Edit
              </Button>
              <Button
                size="small"
                onClick={async () =>
                  await Promise.all([
                    onDeleteInternalDoc(feature.internalDoc),
                    handleDeleteFeature(feature.id),
                  ])
                }
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default FeaturesTable;
