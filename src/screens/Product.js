import React,{useState,useEffect} from "react";
import Slider from "react-slick";
import API from '../utils/api';
import {useHistory, useNavigate, useParams} from 'react-router-dom';

import {ArrowLeft} from 'react-feather';
import { addToCart } from "../redux/ActionCreators";
import { connect } from "react-redux";
import SingleProductLoader from "../components/ui/loaders/SingleProductLoader";
import Navbar from "../components/ui/Navbar";

const mapStateToProps = (state) => {
  return{
      cart: state.cart
  }
}
const mapDispatchToProps = (dispatch) => {
  return{
    addtoCart :(product) => {dispatch(addToCart(product))}
  }
}

function Product(props) {
  let navigate = useNavigate();
  const [add, setAdd] = useState(false);
  const {id} = useParams();
  const [product, setProduct] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(()=>{
    loadProduct();
    
  },[]);

  const loadProduct = async () => {
      const products = await API.get('products/'+id);
      setProduct(products.data);
      setLoaded(true);
  }
  
  const PINCheck = (e) => {
    console.log(e.target.value)
    // Check if PIN Code is from your deliverable area or not.
  }

  return (
    <>
      <div className="product-page">
        {
          (loaded)
          ? <>
            <Navbar title={product.name} description={'Store: ' + product.store.store_name} path={'/search'}/>

            <img src={product.images[0].src} alt={product.name} className="below-header-bar single-product-image" />

            <div className="p-medium">
              <div className="">
                <h3 className="title">{product.name}</h3>
                <h3 className="product-price">₹{product.price}</h3> <h3 className="product-regular-price"> MRP ₹{product.regular_price}</h3>
              </div>
            </div>

            <div className="hr-break"></div>

            <div className="p-medium">
              <div className="widget-title">Select Size</div>
                <form className="delivery-check">
                  <select></select>
                  {/* Handle Attributes & Addons here */}
                </form>
                <p className="fw-light">Select which size you want!</p>
            </div>

            <div className="hr-break"></div>

            <div className="p-medium">
            <div className="widget-title">Shipping & Delivery</div>
              <form className="delivery-check">
                  <input type="text" placeholder="Enter your PIN code" name="pincode" onChange={PINCheck}></input>
                </form>
                <p className="fw-light">Enter your pincode to check if {product.name} can be delivered to your area.</p>
            </div>
            
            <div className="hr-break"></div>

            <div className="p-medium">
            <div className="widget-title">Product Details</div>
              <span className="title">Categories : </span> {product.categories[0].name}
              <p>{product.short_description.replace(/<\/?[^>]+>/gi, '')}</p>
              {product.store.store_name ? <span className="title">Store: {product.store.store_name}</span> : null}
            </div>

            <div className="space-large"></div>

            <div className="row bott-product-button d-flex justify-content-center align-content-center">
                {props.cart.cart.filter(item => item.id === product.id).length === 0 ?
                <button onClick={()=> {props.addtoCart(product); setAdd(true);}} className="cart-button">Add to cart</button>
                :<button onClick={()=> navigate('/cart')} className="cart-button">Go to Cart</button>}
                <button onClick={()=> {props.addtoCart(product); navigate('/checkout')}} className="buy-button">Buy Now</button>
            </div>
            </>
          :<SingleProductLoader loaded={1}/>
        }
      </div>
    </>
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(Product);
