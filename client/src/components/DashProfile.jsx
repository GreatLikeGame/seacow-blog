import { Alert, Button, TextInput } from "flowbite-react";

import { useSelector } from "react-redux";
import React, { useEffect, useRef } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function DashProfile() {
  const { currentUser } = useSelector((state) => state.user);
  const [imagFile, setImageFile] = React.useState(null);
  const [imagFileUrl, setImageFileUrl] = React.useState(null);
  const [imageFileUploadProgress, setimageFileUploadProgress] =
    React.useState(null);
  const [imageFileUploadError, setimageFileUploadError] = React.useState(null);

  //   console.log(imageFileUploadProgress, imageFileUploadError);

  const filePickerRef = useRef();

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageFile(e.target.files[0]);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };
  //   console.log(imagFile, imagFileUrl);
  useEffect(() => {
    if (imagFile) {
      uploadImage();
    }
  }, [imagFile]);

  const uploadImage = async () => {
    //上传头像
    console.log("loading iamg");
    setimageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imagFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imagFile);
    uploadTask.on("state_changed", (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setimageFileUploadProgress(progress.toFixed(0));
    });
    (error) => {
      setimageFileUploadError(
        " could not upload image (File must be less than 2MB)"
      );
      setimageFileUploadProgress(null);
      setImageFile(null);
      setImageFileUrl(null);
    };
    () => {
      getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
        setImageFileUrl(downloadURL);
      });
    };
  };

  return (
    <div className="max-w-lg mx-auto p-3 w-full">
      <h1 className="my-7 text-center font-semibold text-3xl">profile</h1>
      <form className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className="relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full"
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62,152,199,${imageFileUploadProgress / 100})`,
                },
              }}
            />
          )}
          <img
            src={imagFileUrl || currentUser.profilePicture}
            alt="user"
            className={`rounded-full w-full h-full objet-cover border-8 border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              "opacity-60"
            }`}
          />
        </div>
        {imageFileUploadError && <Alert color="failure">{}</Alert>}

        <TextInput
          type="text"
          id="username"
          placeholder="username"
          defaultValue={currentUser.username}
        />

        <TextInput
          type="email"
          id="email"
          placeholder="email"
          defaultValue={currentUser.email}
        />

        <TextInput
          type="password"
          id="password"
          placeholder="password"
          //   defaultValue='*********'
        />
        <Button type="submit" gradientDuoTone="purpleToBlue" outline>
          Upadate
        </Button>
      </form>
      <div className="text-red-500 flex justify-between mt-5 ">
        <span className="cursor-pointer"> Delete Account</span>
        <span className="cursor-pointer"> Sign Out</span>
      </div>
    </div>
  );
}
