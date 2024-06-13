import { Alert, Button, FileInput, Select, TextInput } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
// or const { useQuill } = require('react-quilljs');
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

import "quill/dist/quill.snow.css"; // Add css for snow theme
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

export default function UpdatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formdata, setFormdata] = useState({});
  const [publishEror, setPublishError] = useState(null);
  const navigate = useNavigate();
  const { postId } = useParams();
  const { currentUser } = useSelector((state) => state.user);

  //处理数据
  const [quilldata, setQuillData] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  useEffect(() => {
    try {
      const fetchPost = async () => {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if (!res.ok) {
          console.log(data.message);
          setPublishError(data.message);
          return;
        }
        if (res.ok) {
          setPublishError(null);
          setFormdata(data.posts[0]);
        }

        setQuillData(data.posts[0]);
      };

      fetchPost();

      //   handleData(formdata.content);
    } catch (error) {
      console.log(error);
    }
  }, [postId]);

  // console.log(formdata);
  //   const formats = [
  //     "header",
  //     "bold",
  //     "italic",
  //     "underline",
  //     "list",
  //     "bullet",
  //     "link",
  //     "image",
  //   ];
  const theme = "snow";
  const placeholder = "Write Somthing...";
  const formats = ["bold", "italic", "underline", "strike"];
  const modules = {
    toolbar: [["bold", "italic", "underline", "strike"]],
  };

  const { quill, quillRef } = useQuill({
    theme,
    modules,
    formats,
    placeholder,
  });

  React.useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        // console.log(quillRef.current.firstChild.innerHTML);

        setFormdata((prevFormdata) => ({
          ...prevFormdata,
          content: quillRef.current.firstChild.innerHTML,
        }));
      });
    }
  }, [quill]);

  //   const handleData = (fetchedData) => {
  //     if (quill) {
  //       quill.clipboard.dangerouslyPasteHTML(`${fetchedData}`);
  //     }
  //     // 在这里处理数据
  //   };

  //设置基础内容
  React.useEffect(() => {
    if (quilldata && quill) {
      quill.clipboard.dangerouslyPasteHTML(`${quilldata.content}`);
    }
  }, [quilldata]);

  const handleUploadImage = async () => {
    try {
      console.log("file" + file);
      if (!file) {
        setImageUploadError("Please select an image");
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + "-" + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (sanapshot) => {
          const progress =
            (sanapshot.bytesTransferred / sanapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError("image upload failed");
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormdata({ ...formdata, image: downloadURL });
            // console.log(formdata);
          });
        }
      );
    } catch (error) {
      setImageUploadError("Image upload failed");
      setImageUploadProgress(null);
      console.log(error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `/api/post/updatepost/${formdata._id}/${currentUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formdata),
        }
      );

      const data = await res.json();
      console.log(1);
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      if (data.success === false) {
        setPublishError(data.message);
        return;
      }
      if (res.ok) {
        setPublishError(null);

        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError("something went wrong");
    }
  };

  return (
    <div className="p-3 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-center text-3xl my-7 font-semibold">Update post</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <TextInput
            type="text"
            placeholder="Title "
            required
            id="title"
            className="flex-1"
            onChange={(e) =>
              setFormdata({ ...formdata, title: e.target.value })
            }
            value={formdata.title}
          />

          <Select
            onChange={(e) =>
              setFormdata({ ...formdata, category: e.target.value })
            }
            value={formdata.category}
          >
            <option value="uncategorized">Select a category</option>
            <option value="javascript">Javascript</option>
            <option value="reactjs">React.js</option>
            <option value="nextjs">Next.js</option>
          </Select>
        </div>
        <div className="flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
          <FileInput
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type="button"
            gradientDuoTone="purpleToBlue"
            size="sm"
            outline
            onClick={handleUploadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className="w-16 h-16">
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
                <span>Uploading...</span>
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        </div>
        {/* 错误 */}
        {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}
        {formdata.image && (
          <img
            src={formdata.image}
            alt="upload"
            className="w-full h-72 object-cover"
          ></img>
        )}

        {/* 文字content */}
        <div
          className="h-72 mb-12"
          // required
        >
          <div ref={quillRef} />
        </div>
        <Button type="submit" gradientDuoTone="purpleToPink" className="mt-5">
          Update Post
        </Button>
        {publishEror && (
          <Alert color="failure" className="mt-5">
            {publishEror}
          </Alert>
        )}
      </form>
    </div>
  );
}
