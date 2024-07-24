import axios from 'axios';
import { clearCart,addUser, addOrders, addAddress, addressFailed, ordersLoading, ordersFailed } from "../redux/ActionCreators";
import { createRazorPayOrder, proceedToPayment, verifyPayment } from './razorpay';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { BASEURL, CONSUMER_KEY, CONSUMER_SECRET, WCVERSION, WCFM } from "../config/constants";

// Initialize WooCommerce API
const WOOAPI = (NAMESPACE) => new WooCommerceRestApi({
    url: BASEURL,
    consumerKey: CONSUMER_KEY,
    consumerSecret: CONSUMER_SECRET,
    version: NAMESPACE,
    queryStringAuth: true
});

// const API = WOOAPI(WCVERSION);
const STOREAPI = WOOAPI(WCFM);
const API = axios.create({
  baseURL: "https://growretail.my/wp-json/wc/v3/",
  headers: {
    Authorization:
      "Basic Y2tfMjFiYjRmYjhlNWYyMzk5ODJjZDliZDkyMDA4N2ZjMGZkOTFjZTM0Njpjc19mN2VkMmY3YzIwMmY0YTRjNmQ4YTQzNTg5OTQ4ZmRlNDk3Zjg1ODFi",
  },
});
export default API;

axios.interceptors.request.use(function (config) {
  const { headers = {} } = config || {}
  if (headers['User-Agent']) delete config.headers['User-Agent']
  return config;
});

// USER

export const fetchUser = (user) => (dispatch) => {
    API.get(`customers?email=${user.email}`)
    .then((response) => {
      if(response.data.length) {
         dispatch(addUser(response.data));
      } else { 
        dispatch(createUser(user));
      }
    })
    .catch((error) => {
      console.log(error.response);
    });
}

export const createUser = (user) => (dispatch) => {
    const data = {
        email: user.email,
        first_name: user.given_name,
        last_name: user.family_name,
        username: user.nickname,
        billing: {
          first_name: user.given_name,
          last_name: user.family_name,
          company: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: "",
          email: user.email,
          phone: ""
        },
        shipping: {
          first_name: user.given_name,
          last_name: user.family_name,
          company: "",
          address_1: "",
          address_2: "",
          city: "",
          state: "",
          postcode: "",
          country: ""
        }
    };
    API.post("customers", data)
    .then((response) => {
        dispatch(fetchUser(response.data));
    })
    .catch((error) => {
        console.log(error.response.data);
    });
}

// ORDER

export const createOrder = (payby, user, items, navigate) => (dispatch) => {
    dispatch(ordersLoading());
    const orderData = {
        payment_method: "bacs",
        payment_method_title: "Direct Bank Transfer",
        set_paid: true,
        customer_id: user.id,
        billing: {
          first_name: user.first_name,
          last_name: user.last_name,
          address_1: user.shipping.address_1,
          address_2: user.shipping.address_2,
          city: user.shipping.city,
          state: user.shipping.state,
          postcode: user.shipping.postcode,
          country: user.shipping.country,
          email: user.billing.email,
          phone: user.billing.phone
        },
        shipping: {
          first_name: user.first_name,
          last_name: user.last_name,
          address_1: user.shipping.address_1,
          address_2: user.shipping.address_2,
          city: user.shipping.city,
          state: user.shipping.state,
          postcode: user.shipping.postcode,
          country: user.shipping.country,
        },
        line_items: items.map(item => ({
            product_id: item.id, 
            quantity: item.qty
        })),
        shipping_lines: [
          {
            method_id: "flat_rate",
            method_title: "Flat Rate",
            total: "10.00"
          }
        ]
    };
    API.post("orders", orderData)
    .then((response) => {
        const orderId = response.data.id;
        dispatch(clearCart());
        const options = { 
          amount: parseInt(response.data.total) * 100,
          currency: 'INR',
          receipt: response.data.id
        };
        if (payby === 'RAZORPAY') {
          return createRazorPayOrder({ options, wooId: orderId });
        }
        return { wooId: orderId };
    })
    .then(response => proceedToPayment({ ...response, name: user.first_name, phone: user.billing.phone, email: user.billing.email }))
    .then(response => verifyPayment(response))
    .then(response => navigate(`/track-order/${response.wooId}`))
    .catch((error) => {
        console.error('Order creation failed:', error);
        navigate(`/track-order/${error.response?.data?.id || ''}`);
    });
}

export const fetchOrder = async (orderID) => {
  try {
    const response = await API.get(`orders/${orderID}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
  }
}

// ORDERS

export const fetchOrders = (user) => async (dispatch) => {
    dispatch(ordersLoading());
    try {
        const response = await API.get(`orders?customer=${user.id}`);
        dispatch(addOrders(response.data));
    } catch (error) {
        console.error('Failed to fetch orders:', error.response || error.message);
        dispatch(ordersFailed(error.response ? error.response.data.message : error.message));
    }
};

// ADDRESS

export const fetchAddress = () => (dispatch) => {
  // Implement fetching address logic if needed
}

export const postAddress = (id, telnum, address1, address2, city, state, country, zip) => (dispatch) => {
    const data = {
      billing: {
        address_1: address1,
        address_2: address2,
        city: city,
        state: state,
        country: country,
        postcode: zip,
        phone: telnum
      },
      shipping: {
        address_1: address1,
        address_2: address2,
        city: city,
        state: state,
        country: country,
        postcode: zip, 
        phone: telnum
      }
    }
    API.put(`customers/${id}`, data)
    .then((response) => {
      dispatch(addAddress(data));
    })
    .catch((error) => {
      dispatch(addressFailed(error.response.data.message));
      console.log(error.response.data);
    });
}

// VENDORS

export const FETCH_VENDORS_REQUEST = 'FETCH_VENDORS_REQUEST';
export const FETCH_VENDORS_SUCCESS = 'FETCH_VENDORS_SUCCESS';
export const FETCH_VENDORS_FAILURE = 'FETCH_VENDORS_FAILURE';

export const fetchVendors = () => async (dispatch) => {
  dispatch({ type: FETCH_VENDORS_REQUEST });
  try {
      const response = await axios.get('https://growretail.my/wp-json/wcfmmp/v1/store-vendors', {
          params: {
              consumer_key: CONSUMER_KEY,
              consumer_secret: CONSUMER_SECRET,
          },
      });
      dispatch({ type: FETCH_VENDORS_SUCCESS, payload: response.data });
  } catch (error) {
      console.error('Error fetching vendors:', error);
      dispatch({ type: FETCH_VENDORS_FAILURE, payload: error.message });
  }
};
