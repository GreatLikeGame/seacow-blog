import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInStart, signSuccess, signFailure } from "../redux/user/userSlice";

export default function SignIn() {
  const [formData, setFormData] = useState({});
  // const [errorMessage, setErrorMessage] = useState(null);
  // const [loading, setLoading] = useState(false);
  const { error: errorMessage, loading } = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    //如果有一个没填，就是错误信息
    if (!formData.email || !formData.password) {
      return dispatch(signFailure("Please fill in all fields"));
    }
    try {
      dispatch(signInStart);
      // setLoading(true);
      // setErrorMessage(null);
      //网络请求
      const res = await fetch("/api/auth/signin", {
        method: "Post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      //数据错误
      const data = await res.json();
      if (data.success === false) {
        dispatch(signFailure(data.message));
      }

      if (res.ok) {
        dispatch(signSuccess(data));
        navigate("/");
      }
    } catch (error) {
      dispatch(signFailure(error.message));
      // setErrorMessage(error.message);
      // setLoading(false);
    }
  };
  // console.log(formData);
  return (
    <div className="min-h-screen mt-20">
      <div className="flex p-3 max-w-3xl  mx-auto flex-col md:flex-row md:items-center gap-5">
        {/* lefside */}
        <div className="flex-1">
          <Link to="/" className=" font-bold dark:text-white text-4xl">
            <span className="px-2 py-1 bg-gradient-to-t from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
              {" "}
              Seacows's{" "}
            </span>{" "}
            Blog
          </Link>

          <p className="text-sm mt-5">
            {" "}
            you can sign in with your email and password or with Google
          </p>
        </div>
        {/* rightside */}
        <div className="flex-1">
          <div className="">
            <form className=" flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label value="your user email"></Label>
                <TextInput
                  type="email"
                  placeholder="name@company.com"
                  id="email"
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label value="your user password"></Label>
                <TextInput
                  type="password"
                  placeholder="*********"
                  id="password"
                  onChange={handleChange}
                />
              </div>
              <Button
                gradientDuoTone="purpleToPink"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm">
                      <span className="pl-3">Loading </span>
                    </Spinner>
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
            <div className="flex gap-2 text-sm mt-5">
              <span> have an account</span>
              <Link to="/sign-up" className="text-blue-500">
                {" "}
                Sign Up
              </Link>
            </div>
            {errorMessage && (
              <Alert className="mt-5" color="failure">
                {errorMessage}
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
