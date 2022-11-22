import { Storage } from "aws-amplify";
import Image from "next/image";
import React, { useEffect, useState } from "react";

function StorageImage({ image }) {
  const [signedUrl, setSignedUrl] = useState("");
  useEffect(() => {
    const fetchSignedUrl = async () => {
      const result = await Storage.get(image);
      setSignedUrl(result);
    };

    fetchSignedUrl();
  }, [image]);

  return signedUrl ? (
    <Image src={signedUrl} alt="image" width={50} height={50} />
  ) : null;
}

export default StorageImage;
