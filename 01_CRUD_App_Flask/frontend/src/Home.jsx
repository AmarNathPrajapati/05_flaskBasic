import axios from "axios";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
axios.defaults.baseURL = "http://127.0.0.1:5000"

const Home = () => {
  //Step:1  storing the new data
  const [data, setdata] = useState({ firstName: "", lastName: "", emailId: "" })//should be exactly same as name values

  //handle on change for the new data
  const handleChange = (e) => {
    const name = e.target.name; // value of name attribute
    const value = e.target.value; // value of value attribute
    setdata((prev) => {
      return ({
        ...prev,
        [name]: value
      })
    })
  }
  //posting the data (for the new data)
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('/users', data).then(() => {
      alert("Data successfully added");
      setdata({
        'firstName': '',
        'lastName': '',
        'emailId': ''
      })
      getFetchData();
    }).catch(() => {
      alert("Something went wrong")
    })
  }

//Step:2 get all users data
const [getData, setGetData] = useState([]);
const getFetchData = async () => {
  try {
    const response = await axios.get('/users');
    if (response.data.status === 'success') {
      setGetData(response.data.UsersData);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

useEffect(() => {
  getFetchData();
}, []);



  //Step3: ****** Deleting the data ********/
  //deleting the user data
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/users/${id}`);
      alert(response.data.status);
      getFetchData();
    } catch (error) {
      alert('Error deleting data');
      console.error('Error deleting data:', error);
    }
  }



  return (
    <div className="w-2/3 mx-auto mt-5">
      {/* creating form */}
      <form onSubmit={handleSubmit}>
        <h1>Create User</h1>
        <div className="">
          <label className=" text-sm text-gray-500 ">First Name</label>
          <input
            type="text"
            name="firstName"
            className="block py-2.5 px-3 w-full text-sm text-gray-900 bg-transparent  border-2 border-gray-300"
            placeholder="Enter name"
            required
            value={data.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="">
          <label className=" text-sm text-gray-500 ">Last Name</label>
          <input
            type="text"
            name="lastName"
            className="block py-2.5 px-3 w-full text-sm text-gray-900 bg-transparent  border-2 border-gray-300"
            placeholder="Enter email "
            required
            value={data.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="">
          <label className=" text-sm text-gray-500 ">Email Id</label>
          <input
            type="email"
            name="emailId"
            className="block py-2.5 px-3 w-full text-sm text-gray-900 bg-transparent  border-2 border-gray-300"
            placeholder="Enter EmailId "
            required
            value={data.emailId}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-center my-4">
          <button type="submit" className="px-4 py-2 bg-yellow-400 rounded-sm">
            Add User
          </button>
        </div>
      </form>

      <div className="relative overflow-x-auto shadow-md">
        <table className="w-full text-lg text-center text-gray-500 ">
          <thead className="text-[17px] text-gray-700 uppercase bg-gray-500">
            <tr>
              <th scope="col" className="px-6 py-3">
                SN.
              </th>
              <th scope="col" className="px-6 py-3">
                First Name
              </th>
              <th scope="col" className="px-6 py-3">
                Last Name
              </th>
              <th scope="col" className="px-6 py-3">
                EmailId
              </th>
              <th scope="col" className="px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {getData.map((item, i) => (
              <tr className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {i + 1}
                </th>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                >
                  {item?.firstName}
                </th>
                <td className="px-6 py-4"> {item?.lastName}</td>
                <td className="px-6 py-4"> {item?.emailId}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-x-4 justify-center">
                    <NavLink
                      to={`/readuser/${item.id}`}
                      className="font-medium text-green-600 dark:text-blue-500 hover:underline"
                    >
                      Read
                    </NavLink>
                    <NavLink
                      to={`/updateuser/${item.id}`}
                      className="font-medium text-yellow-400 dark:text-blue-500 hover:underline"
                    >
                      Edit
                    </NavLink>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="font-medium text-red-500  hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
