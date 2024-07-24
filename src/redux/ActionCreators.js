import * as ActionTypes from './ActionTypes';
// import { addOrders } from "../redux/ActionCreators";

export const addToCart = (product) => ({
  type: ActionTypes.ADD_TO_CART,
  payload: product
});

export const clearCart = () => ({
    type: ActionTypes.CLEAR_CART
});

export const removeFromCart = (id) => ({
    type: ActionTypes.REMOVE_FROM_CART,
    payload: id
});

// In ActionCreators.js
export const addUser = (user) => ({
  type: 'ADD_USER',
  payload: user
});


export const userFailed = (errMess) => ({
    type: ActionTypes.USER_FAILED,
    payload: errMess
});

// Remove the duplicate declaration
export const addOrders = (orders) => ({
  type: ActionTypes.ADD_ORDERS,
  payload: orders
});

// Ensure there is no duplicate
export const ordersLoading = () => ({
    type: ActionTypes.ORDERS_LOADING
});

export const ordersLoaded = () => ({
    type: ActionTypes.ORDERS_LOADED
});

export const ordersFailed = (errMess) => ({
    type: ActionTypes.ORDERS_FAILED,
    payload: errMess
});

export const addStores = (stores) => ({
    type: ActionTypes.ADD_STORES,
    payload: stores
});

export const storesFailed = (errMess) => ({
    type: ActionTypes.STORES_FAILED,
    payload: errMess
});

export const addAddress = (address) => ({
  type: 'ADD_ADDRESS',
  payload: address
});

export const addressFailed = (error) => ({
  type: 'ADDRESS_FAILED',
  payload: error
});