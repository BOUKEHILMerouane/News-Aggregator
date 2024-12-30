import React, { useState } from "react";


const AuthModal = ({ isOpen, onClose, handleLogin }) => {
    const [isLogin, setIsLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setFormData({ username: "", email: "", password: "" }); // Reset fields
        setErrors({});
    };

    const validateInputs = () => {
        const newErrors = {};

        if (!isLogin && !formData.username.trim()) {
            newErrors.username = "Username is required";
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!isLogin && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (!formData.password.trim()) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateInputs()) return;



        setLoading(true);
        try {
            if (isLogin) {

                // Login API Call
                const response = await fetch(`${backendUrl}/api/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    // Save user details and token in session storage
                    handleLogin({
                        id: data.user.id,
                        username: data.user.username,
                    });

                    localStorage.setItem('token', data.token);

                    console.log('Login successful:', data);
                    onClose(); // Close modal
                } else {
                    const errorData = await response.json();
                    console.error('Login failed:', errorData);
                    setErrors({ ...errors, general: errorData.message });
                }
            } else {
                // Signup API Call
                const signupResponse = await fetch(`${backendUrl}/api/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                if (signupResponse.ok) {
                    const signupData = await signupResponse.json();
                    console.log('Signup successful:', signupData);

                    // Automatically log in after signup
                    const loginResponse = await fetch(`${backendUrl}/api/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email: formData.email,
                            password: formData.password,
                        }),
                    });

                    if (loginResponse.ok) {
                        const loginData = await loginResponse.json();
                        // Save user details and token in session storage
                        handleLogin({
                            id: loginData.user.id,
                            username: loginData.user.username,
                        });
                        sessionStorage.setItem('token', loginData.token);

                        console.log('Login successful after signup:', loginData);
                        onClose(); // Close modal
                    } else {
                        const loginErrorData = await loginResponse.json();
                        console.error('Login after signup failed:', loginErrorData);
                        setErrors({ ...errors, general: loginErrorData.message });
                    }
                } else {
                    const signupErrorData = await signupResponse.json();
                    console.error('Signup failed:', signupErrorData);
                    setErrors({ ...errors, general: signupErrorData.message });
                }
            }
            onClose(); // Close modal
        } catch (error) {
            console.log("An error occurred during the login/signup process.");
            console.error("Error details:", error);

            if (error instanceof TypeError) {
                console.error("This could be a network error or CORS issue.");
            } else {
                console.error("Unexpected error:", error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-4 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    className="absolute top-2 right-2 text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100 transition"
                    onClick={onClose}
                >
                    <i className="fas fa-times"></i>
                </button>

                <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">
                    {isLogin ? "Login" : "Sign Up"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username */}
                    {!isLogin && (<div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-800 dark:text-gray-300"
                        >
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                            className={`w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-300 custom-autofill ${errors.username
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                                } focus:outline-none focus:ring ${errors.username
                                    ? "ring-red-500"
                                    : "ring-blue-500 dark:ring-blue-400"
                                }`}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>
                    )}

                    {/* Email */}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-800 dark:text-gray-300"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className={`w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-300 custom-autofill ${errors.email
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                                } focus:outline-none focus:ring ${errors.email
                                    ? "ring-red-500"
                                    : "ring-blue-500 dark:ring-blue-400"
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>


                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-800 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                            className={`w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-300 ${errors.password
                                ? "border-red-500"
                                : "border-gray-300 dark:border-gray-600"
                                } focus:outline-none focus:ring ${errors.password
                                    ? "ring-red-500"
                                    : "ring-blue-500 dark:ring-blue-400"
                                }`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-2 rounded-md transition ${loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                    >
                        {loading ? "Processing..." : isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <p className="text-center text-sm mt-4 dark:text-gray-300">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        type="button"
                        onClick={toggleForm}
                        className="text-blue-500 hover:underline dark:text-blue-400"
                    >
                        {isLogin ? "Sign Up" : "Login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
