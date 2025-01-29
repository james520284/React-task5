import { useEffect, useRef, useState } from 'react'
import { useForm,useWatch } from "react-hook-form"
import axios from 'axios'
import { Modal } from 'bootstrap';
import {Toast} from 'bootstrap';
import ReactLoading from 'react-loading'

console.clear();
const baseUrl = import.meta.env.VITE_BASE_URL;
const apiPath = import.meta.env.VITE_API_PATH;


function App() {
  // 顧客API相關
  // 取得商品列表 API
  const [productsData,setProductsData] = useState([]);
  const getProductsData = async ( page=1 ) => {
      setIsLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/${apiPath}/products?page=${page}`);
      setProductsData(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.log(err.response?.data?.message);
    }finally{
      setIsLoading(false);
    }
  };
  
  // 取得購物車 API
  const [cartsData,setCartsData] = useState([]);
  const getCartsData = async() => {
      setIsLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/${apiPath}/cart`);
      setCartsData(res.data.data.carts);
    } catch (err) {
      console.log(err.response?.data?.message);
    }finally{
      setIsLoading(false);
    }
  };
  
  // 加入購物車 API
  const [productQty,setProductQty] = useState(1);
  const postCarts =async (id,qty=1) => {
    const dataFormat = {
      data:{
        product_id:id,
        qty,
      }
    }
      setIsLoading(true);
    try {
      await axios.post(`${baseUrl}/api/${apiPath}/cart`,dataFormat);
      await getCartsData();
      setAlertMsg('恭喜您成功加入購物車！');
      alertToast.current.show();     
    } catch (err) {
      console.log(err.response?.data?.message);
    }finally{
      setIsLoading(false);
    }
  };

  // 更新購物車 API
  const putCartData = async(cartId,productId,qty) => {
    const dataFormat = {
      data:{
        product_id:productId,
        qty,
      }
    }
      setIsLoading(true);
    try {
      await axios.put(`${baseUrl}/api/${apiPath}/cart/${cartId}`,dataFormat);
      await getCartsData();
    } catch (err) {
      console.log(err.response?.data?.message);
    }finally{
      setIsLoading(false);
    }
  };

  // 刪除購物車(一個) API
  const deleteCart = async (id) => {
      setIsLoading(true);
    try {
      await axios.delete(`${baseUrl}/api/${apiPath}/cart/${id}`);
      setAlertMsg('您已刪除這個劇會QQ');
      alertToast.current.show();
      await getCartsData();
    } catch (err) {
      console.log(err.response?.data?.message);
    }finally{
      setIsLoading(false);
    }
  };

  // 刪除購物車(全部) API
  const deleteAllCarts = async () => {
      setIsLoading(true);
    try {
      await axios.delete(`${baseUrl}/api/${apiPath}/carts`);
      setAlertMsg('OMG！您已刪除所有的劇會QQ');
      alertToast.current.show();
      await getCartsData();
    } catch (err) {
      setAlertMsg(err.response?.data?.message);
      alertToast.current.show();
    }finally{
      setIsLoading(false);
    }
  };

  // 優惠券 API
  const [couponTxt,setCouponTxt] = useState('');
  const postCoupon = async (couponTxt) => {
    const updateFormat = {
      data:{
        code:couponTxt
      }
    };
      setIsLoading(true);
    try {
      const res = await axios.post(`${baseUrl}/api/${apiPath}/coupon`,updateFormat);
      console.log(res);
    } catch (err) {
      setAlertMsg(err.response?.data?.message);
      alertToast.current.show();
    }finally{
      setIsLoading(false);
    }
  };

  // Modal
  const modalRef = useRef(null);
  const productModal = useRef(null);
  const [modalData,setModalData] = useState({});
  const openModal = () => {
    setProductQty(1);
    setTimeout(() => {
    productModal.current.show();
    }, 0);
  };

  const closeModal = () => {
    productModal.current.hide();
  };

  const addCart = async (id,qty) => {
    await postCarts(id,qty);
    await getCartsData();
    setTimeout(()=>{
      closeModal();
    },0);
  };

  // Pagination
  const [pagination,setPagination] = useState({});
  const handleChangePage = async (e,page) => {
    e.preventDefault();
    await getProductsData(page);
  };
  
  // Toast
  const toastRef = useRef(null);
  const alertToast = useRef(null);
  const [alertMsg,setAlertMsg] = useState('');
  const closeToast = () => {
    alertToast.current.hide();
  };

  // Loading
  const [isLoading,setIsLoading] = useState(false);

  // useEffect
  useEffect(()=>{
    (async() => {
      await getProductsData();
      await getCartsData();
    })();    
  },[]);
  
  useEffect(()=>{
    productModal.current = new Modal(modalRef.current);
  },[]);

  useEffect(()=>{
    alertToast.current = new Toast(toastRef.current);
  },[]);

  return (
    <>
      {/* 商品列表 */}
      <table className='table align-middle'>
        <thead>
          <tr>
            <th>圖片</th>
            <th>產品名稱</th>
            <th>價錢</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            productsData&&
            productsData.map(product => {
              const {id,origin_price,price,title} = product;
              return(
                <tr key={product.id}>
                  <td>
                    <img src={product.imageUrl} alt={title} className='img-cover' style={{width:'150px'}}/>
                  </td>
                  <td className='h5'>{title}</td>
                  <td>
                    <del>原價：{origin_price}元</del>
                    <br />
                    <span className='h5'>特價：{price}元</span>
                  </td>
                  <td>
                    <div className="btn-group">
                      <button
                      type='button'
                      className="btn btn-dark"
                      onClick={()=>{
                        setModalData(product);
                        openModal();
                      }}
                      >查看更多</button>
                      <button
                      type='button'
                      className="btn btn-primary"
                      onClick={()=>postCarts(id,1)}
                      >加入購物車</button>
                    </div>
                  </td>
                </tr>
              )})
          }
          
        </tbody>
      </table>

      {/* 商品詳請 Modal */}
      {
        <div className="modal fade" tabIndex="-1" ref={modalRef}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title fs-5">劇會名稱：{modalData.title}</h3>
                <button type="button" className="btn-close"  aria-label="Close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <div>
                <img src={modalData.imageUrl} alt={modalData.title} className='img-cover'/>
                </div>
                <p>商品簡述：{modalData.description}</p>
                <p>商品內容：{modalData.content}</p>
                <p>價錢：<del className='mx-2'>原價${modalData.origin_price}</del><span>特價${modalData.price}</span></p>
                <div className="d-flex align-items-center">
                  <label htmlFor='qtyNumInput' className='form-label text-nowrap'>購買數量：</label>
                  <button
                  type="button"
                  className='minusBtn p-0'
                  onClick={()=>{setProductQty(prev => prev===1?prev:prev-1)}}
                  ><i className="bi bi-dash-square-fill fs-5 mx-3"></i></button>
                  <input
                  type="number"
                  id={modalData.id}
                  className='form-control w-100'
                  name={modalData.id}
                  value={productQty}
                  onChange={e=>setProductQty(Number(e.target.value))}
                  min="1"
                  max="10"
                  />
                  <button
                  type="button"
                  className='addBtn p-0'
                  onClick={()=>{setProductQty(prev => prev===10?prev:prev+1)}}
                  ><i className="bi bi-plus-square-fill fs-5 mx-3"></i></button>
                </div>
              </div>
              <div className="modal-footer">
                <button
                type="button"
                className="btn btn-primary"
                onClick={()=>{addCart(modalData.id,productQty)}}
                >加入購物車</button>
              </div>
            </div>
          </div>
        </div>
      }

      {/* 商品列表頁碼 */}
      <nav aria-label="Page navigation">
        <ul className="pagination">
          <li className={`page-item ${!pagination.has_pre&& 'disabled'}`}>
            <a className="page-link" href="#" aria-label="Previous" onClick={(e)=>handleChangePage(e,pagination.current_page-1)}>
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {
            pagination&&
            Array.from({length:pagination.total_pages}).map((_,index) => 
              <li className={`page-item ${pagination.current_page === index+1 && 'active'}`} key={index}><a className="page-link" href="#" onClick={(e)=>handleChangePage(e,index+1)}>{index+1}</a></li>
            )
          }          
          <li className={`page-item ${!pagination.has_next&& 'disabled'}`}>
            <a className="page-link" href="#" aria-label="Next" onClick={(e)=>handleChangePage(e,pagination.current_page+1)}>
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* 購物車明細 */}
      <button type="button" className='btn btn-outline-secondary d-block ms-auto' onClick={deleteAllCarts}>清空購物車</button>
      <table className='table align-middle mb-3'>
        <thead>
          <tr>
            <th></th>
            <th>品名</th>
            <th>數量/單位</th>
            <th>單價</th>
          </tr>
        </thead>
        <tbody>
          {
            cartsData.map(cart => 
              <tr key={cart.id}>
                <td>
                  <button type='button' className="btn btn-outline-danger" onClick={()=>deleteCart(cart.id)}>刪除</button>
                </td>
                <td>{cart.product.title}</td>
                <td>
                  <div className="input-group">
                    <input
                    id={cart.id}
                    type="number"
                    className="form-control"
                    min='1'
                    max='10'
                    value={cart.qty}
                    onChange={(e)=>putCartData(cart.id,cart.product.id,Number(e.target.value))}
                    placeholder="請輸入數字1~10"
                    aria-label="請輸入數字1~10"
                    aria-describedby="qty"
                    />
                    <span className="input-group-text" id="unit">/{cart.product.unit}</span>
                  </div>
                </td>
                <td>{cart.product.price}</td>
              </tr>
            )
          }
          
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className='text-end'>總計</td>
            <td>
              {
                cartsData.reduce((acc,cur)=>acc+cur.final_total,0)
              }
            </td>
          </tr>
        </tfoot>
      </table>

      {/* 優惠碼 */}
      <div className='mb-5 d-flex'>
        <div className='form-floating w-100'>
          <input
          type="text"
          className='form-control'
          placeholder="請輸入優惠碼"
          id='coupon'
          value={couponTxt}
          onChange={e=>setCouponTxt(e.target.value)}
          />
          <label htmlFor="coupon">優惠碼</label>
        </div>
        <button 
        type="button" 
        className='btn btn-warning text-nowrap'
        onClick={()=>postCoupon(couponTxt)}
        >套用優惠碼</button>
      </div>

      {/* 結帳表單 */}
      <UserForm setAlertMsg={setAlertMsg} alertToast={alertToast} getCartsData={getCartsData} cartsData={cartsData}/>        

      {/* 提示Toast */}
      <div className="toast toast-wrap" role="alert" aria-live="assertive" aria-atomic="true" ref={toastRef}>
        <div className="toast-header bg-dark text-light">
          <strong className="me-auto">小提醒</strong>
          <button
          type="button"
          className="btn-close btn-close-white" 
          aria-label="Close"
          onClick={closeToast}
          ></button>
        </div>
        <div className="toast-body bg-light">
          {alertMsg}
        </div>
      </div>

      {/* Loading */}
      {
        isLoading && 
        (
          <div className='loadingStyle'>
            <ReactLoading type={'spin'} color={'#000'} height={30} width={30} />
          </div>
        )
      }
    </>
  )
}

// Form
const UserForm = ({setAlertMsg,alertToast,getCartsData,cartsData}) => {
  const [buyerInfo,setBuyerInfo] = useState({});
  const isFirstRender = useRef(true);
  const {
    register,
    handleSubmit,
    reset,
    formState:{errors}
  } = useForm({
    defaultValues:{
      name:'',
      email:'',
      tel:'',
      address:'',
      message:''
    },
    mode:'onBlur'
  });
  
  const onSubmitOrder = async (data) => {
    setBuyerInfo(data);
    reset();
  };
  // 結帳 API
  const sendOrder = async () => {
    const {message} = buyerInfo;
    const updateFormat = {
      data:{
        user:buyerInfo,
        message,
      }
    }
    try {
      await axios.post(`${baseUrl}/api/${apiPath}/order`,updateFormat);
      setAlertMsg('您已成功送出訂單');
      alertToast.current.show();
      await getCartsData();
    } catch (err) {
      setAlertMsg(err.response?.data?.message);
      alertToast.current.show();
    }
  };

  useEffect(()=>{
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }else if (cartsData.length===0) {
      setAlertMsg('您的購物車沒有東西');
      alertToast.current.show();
      return;
    }
    sendOrder();
  },[buyerInfo]);

  return (
  <>
  <form onSubmit={handleSubmit(onSubmitOrder)}    className='w-50 mx-auto'>
    <div className='form-floating mb-3'>
      <input
      type="text"
      className={`form-control ${errors.name&&'formInput-Err'}`}
      placeholder="name@example.com"
      id='name'
      {...register('name',{
        required:'姓名為必填'
      })}
      />
      <label htmlFor="name" >收件人姓名</label>
      <span className={errors.name&&'form-ErrMsg'}>{errors.name&&errors.name.message}</span>
    </div>

    <div className='form-floating mb-3'>
      <input
      type="email"
      className={`form-control ${errors.email&&'formInput-Err'}`}
      placeholder="Password"
      id='email'
      {...register('email',{
        required:'Email為必填',
        pattern:{
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: "請輸入有效的 Email 格式",
        }
      })}
      />
      <label htmlFor="email" >電子信箱</label>
      <span className={errors.email&&'form-ErrMsg'}>{errors.email&&errors.email.message}</span>
    </div>

    <div className='form-floating mb-3'>
      <input
      type="tel"
      className={`form-control ${errors.tel&&'formInput-Err'}`}
      placeholder="Tel"
      id='tel'
      {...register('tel',{
        required:'電話為必填',
        maxLength:{
          value:8,
          message:'電話長度不可以超過10個字元'
        }
      })}
      />
      <label htmlFor="tel" >收件人電話</label>
      <span className={errors.tel&&'form-ErrMsg'}>{errors.tel&&errors.tel.message}</span>
    </div>

    <div className='form-floating mb-3'>
      <input
      type="text"
      className={`form-control ${errors.address&&'formInput-Err'}`}
      placeholder="Address"
      id='address'
      {...register('address',{
        required:'地址為必填'
      })}
      />
      <label htmlFor="address" >收件人地址</label>
      <span className={errors.address&&'form-ErrMsg'}>{errors.address&&errors.address.message}</span>
    </div>

    <div className='form-floating mb-3'>
      <textarea
      className='form-control'
      style={{height:'100px'}}
      placeholder="Message"
      id='message'
      {...register('message')}
      />
      <label htmlFor="message" >留言</label>
    </div>
    
    <button type="submit" className='btn btn-danger d-block ms-auto mt-3'>送出訂單</button>
    
  </form>
  </>
  )
};



export default App
