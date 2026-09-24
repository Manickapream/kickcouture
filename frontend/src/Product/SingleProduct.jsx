import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaChevronDown, FaHeart, FaRegHeart, FaTrash, FaEdit } from 'react-icons/fa';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import './SingleProduct.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const SingleProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isUserLoggedIn, userData } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(false);
  const [moreInfoOpen, setMoreInfoOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
        const wishlistItems = JSON.parse(stored);
        const isPresent = wishlistItems.some(item => item._id === product._id);
        setInWishlist(isPresent);
      }
    }
  }, [product]);

  const toggleWishlist = () => {
    if (!isUserLoggedIn || !userData?.email) {
      navigate('/UserLogin');
      return;
    }

    let wishlistItems = [];
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      wishlistItems = JSON.parse(stored);
    }

    if (inWishlist) {
      wishlistItems = wishlistItems.filter(item => item._id !== product._id);
      setInWishlist(false);
    } else {
      wishlistItems.push(product);
      setInWishlist(true);
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const fetchProduct = async () => {
    try {
      // Try fetching single product first
      const res = await api.get(`/api/product/get/${id}`);
      setProduct(res.data);
      setActiveImage(res.data.image);
      fetchRelated(res.data.brand, id);
    } catch (err) {
      // Fallback: fetch all products and find by ID
      try {
        const res = await api.get('/api/product/get');
        const products = res.data.products || res.data.data || res.data;
        const found = products.find(p => p._id === id);
        if (found) {
          setProduct(found);
          setActiveImage(found.image);
          const related = products.filter(p => p.brand === found.brand && p._id !== found._id);
          setRelatedProducts(related);
        } else {
          alert('Product not found');
          navigate('/collection');
        }
      } catch (fallbackErr) {
        console.error("Error fetching product:", fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (brand, currentId) => {
    try {
      const res = await api.get('/api/product/get');
      const products = res.data.products || res.data.data || res.data;
      const related = products.filter(p => p.brand === brand && p._id !== currentId);
      setRelatedProducts(related);
    } catch (err) {
      console.error('Error fetching related products', err);
    }
  };

  const handleAddToCart = async () => {
    if (!isUserLoggedIn || !userData?.email) {
      navigate('/UserLogin');
      return;
    }
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    try {
      const res = await api.post("/api/order/add", {
        email: userData.email,
        productId: product._id,
        status: "cart",
        quantity: quantity,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart');
    } catch (err) {
      console.error("Error adding to cart", err);
      const errMsg = err.response?.data?.message || "Error adding to cart";
      alert(errMsg);
    }
  };

  const handleBuyNow = () => {
    if (!isUserLoggedIn || !userData?.email) {
      navigate('/UserLogin');
      return;
    }
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    
    navigate("/payment", {  
      state: { 
        product: product,
        quantity: quantity,
        size: selectedSize
      }
    }); 
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    
    setSubmittingReview(true);
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('userToken');
      const name = userData?.name || email.split('@')[0];

      const method = isEditingReview ? 'PUT' : 'POST';
      const res = await fetch(`${API_BASE}/api/product/${product._id}/review`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userEmail: email,
          name: name,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit review');

      alert(isEditingReview ? "Review updated successfully!" : "Review submitted successfully!");
      setReviewComment("");
      setIsEditingReview(false);
      setProduct(data.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('userToken');
      
      const res = await fetch(`${API_BASE}/api/product/${product._id}/review`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userEmail: email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete review');

      alert("Review deleted successfully!");
      setProduct(data.data);
      setReviewComment("");
      setReviewRating(5);
      setIsEditingReview(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditClick = (rv) => {
    setIsEditingReview(true);
    setReviewRating(rv.rating);
    setReviewComment(rv.comment);
    // Scroll to form (optional)
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (!product) return null;

  // Split comma separated sizes
  const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];
  
  // Collect all images
  const allImages = [product.image];
  if (product.additionalImages && product.additionalImages.length > 0) {
    product.additionalImages.forEach(img => allImages.push(img));
  }

  return (
    <div className="sp-container">
      <div className="sp-breadcrumb">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link> / <Link to="/collection" style={{ textDecoration: 'none', color: 'inherit' }}>{product.brand}</Link> / <span>{product.name}</span>
      </div>

      <div className="sp-grid">
        {/* Left: Images */}
        <div className="sp-gallery">
          <div className="sp-thumbnails">
            {allImages.map((img, idx) => (
              <img 
                key={idx}
                src={`${API_BASE}/${img}`}
                alt="Thumbnail"
                className={`sp-thumb ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
          <div className="sp-main-image">
            <img src={`${API_BASE}/${activeImage}`} alt={product.name} />
          </div>
        </div>

        {/* Right: Info */}
        <div className="sp-details">
          <div className="sp-brand">{product.brand}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="sp-title" style={{ marginBottom: 0 }}>{product.name}</h1>
            <button 
              onClick={toggleWishlist} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: inWishlist ? '#e52e71' : '#9ca3af', display: 'flex', alignItems: 'center', transition: 'color 0.2s', outline: 'none' }}
              title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              {inWishlist ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
          
          <div className="sp-pricing">
            <span className="sp-price">MRP ₹{product.price}</span>
            {product.originalPrice && (
              <span className="sp-original-price">MRP ₹{product.originalPrice}</span>
            )}
          </div>
          <div className="sp-tax-info">Tax included. Shipping calculated at checkout.</div>

          {product.color && (
            <div className="sp-color">
              Color: 
              <br/>
              <div className="sp-color-box">{product.color}</div>
            </div>
          )}

          <div className="sp-sizes-header">
            <span>Size: {selectedSize || ''}</span>
            <span className="sp-size-chart">Size Chart</span>
          </div>
          <div className="sp-sizes-grid">
            {sizes.map(size => (
              <button 
                key={size}
                className={`sp-size-btn ${selectedSize === size ? 'selected' : ''}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Stock Status */}
          {(() => {
            const isOutOfStock =
              product.stockStatus === "Out of Stock" ||
              (product.count !== undefined && product.count !== null && product.count === 0);
            return (
              <div className={`sp-stock ${isOutOfStock ? 'sp-stock-out' : ''}`}>
                {isOutOfStock ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Out of Stock
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {product.count > 0 ? `In Stock (${product.count} left)` : 'In Stock'}
                  </>
                )}
              </div>
            );
          })()}

          <div className="sp-quantity-wrap">
            <span className="sp-quantity-label">Quantity:</span>
            <div className="sp-quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button
                onClick={() => {
                  const maxStock = product.count !== undefined && product.count !== null ? product.count : Infinity;
                  if (quantity < maxStock) {
                    setQuantity(quantity + 1);
                  } else {
                    alert(`Only ${product.count} item(s) available in stock!`);
                  }
                }}
                disabled={product.count !== undefined && product.count !== null && quantity >= product.count}
                title={product.count !== undefined && product.count !== null && quantity >= product.count ? `Max stock: ${product.count}` : ''}
                style={product.count !== undefined && product.count !== null && quantity >= product.count ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
              >+</button>
            </div>
            {product.count !== undefined && product.count !== null && product.count > 0 && (
              <span style={{ fontSize: '0.78rem', color: quantity >= product.count ? '#e52e71' : '#6b7280', marginTop: '4px', display: 'block' }}>
                {quantity >= product.count ? `⚠️ Maximum stock reached (${product.count})` : `${product.count} in stock`}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {(() => {
            const isOutOfStock =
              product.stockStatus === "Out of Stock" ||
              (product.count !== undefined && product.count !== null && product.count === 0);
            return (
              <div className="sp-actions">
                <button
                  className="btn-add-to-cart"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to cart'}
                </button>
                <button
                  className="btn-buy-now"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  style={isOutOfStock ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  Buy Now
                </button>
              </div>
            );
          })()}

          <div className="sp-accordion">
            <div className="sp-accordion-item">
              <button className="sp-accordion-header" onClick={() => setDescOpen(!descOpen)}>
                <span>Description</span>
                <FaChevronDown className={`sp-chevron ${descOpen ? 'open' : ''}`} />
              </button>
              {descOpen && (
                <div className="sp-accordion-body">
                  <p>{product.description || product.desc || 'No description available.'}</p>
                </div>
              )}
            </div>

            <div className="sp-accordion-item">
              <button className="sp-accordion-header" onClick={() => setMoreInfoOpen(!moreInfoOpen)}>
                <span>More Info</span>
                <FaChevronDown className={`sp-chevron ${moreInfoOpen ? 'open' : ''}`} />
              </button>
              {moreInfoOpen && (
                <div className="sp-accordion-body">
                  {product.manufacturedPackedBy && (
                    <div className="legal-block">
                      <h5>Manufactured &amp; Packed By</h5>
                      <p>{product.manufacturedPackedBy}</p>
                    </div>
                  )}
                  {product.consumerComplaints && (
                    <div className="legal-block">
                      <h5>Consumer Complaints</h5>
                      <p>{product.consumerComplaints}</p>
                    </div>
                  )}
                  {product.countryOfOrigin && (
                    <div className="legal-block">
                      <h5>Country of Origin</h5>
                      <p>{product.countryOfOrigin}</p>
                    </div>
                  )}
                  {!product.manufacturedPackedBy && !product.consumerComplaints && !product.countryOfOrigin && (
                    <p>No additional information available.</p>
                  )}
                </div>
              )}
            </div>

            <div className="sp-accordion-item">
              <button className="sp-accordion-header" onClick={() => setReviewsOpen(!reviewsOpen)}>
                <span>Reviews ({product.reviews?.length || 0})</span>
                <FaChevronDown className={`sp-chevron ${reviewsOpen ? 'open' : ''}`} />
              </button>
              {reviewsOpen && (
                <div className="sp-accordion-body sp-reviews-body">
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="sp-review-list">
                      {product.reviews.map((rv, idx) => {
                        const isMyReview = isUserLoggedIn && rv.userEmail === localStorage.getItem('userEmail');
                        return (
                          <div key={idx} className="sp-review-item">
                            <div className="sp-review-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong>{rv.name} {isMyReview && "(You)"}</strong>
                                <span className="sp-review-rating">
                                  {'★'.repeat(rv.rating)}{'☆'.repeat(5 - rv.rating)}
                                </span>
                              </div>
                              {isMyReview && (
                                <div className="sp-review-actions">
                                  <button onClick={() => handleEditClick(rv)} className="sp-edit-btn" title="Edit">
                                    <FaEdit />
                                  </button>
                                  <button onClick={deleteReview} className="sp-delete-btn" title="Delete">
                                    <FaTrash />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="sp-review-comment">{rv.comment}</p>
                            <small className="sp-review-date">{new Date(rv.createdAt).toLocaleDateString()}</small>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>No reviews yet. Be the first to review!</p>
                  )}

                  {isUserLoggedIn ? (
                    (!product.reviews?.some(r => r.userEmail === localStorage.getItem('userEmail')) || isEditingReview) ? (
                      <form className="sp-review-form" onSubmit={submitReview}>
                        <h4>{isEditingReview ? 'Update Your Review' : 'Leave a Review'}</h4>
                        <div className="sp-review-rating-input">
                          <label>Rating:</label>
                          <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))}>
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very Good</option>
                            <option value="3">3 - Good</option>
                            <option value="2">2 - Fair</option>
                            <option value="1">1 - Poor</option>
                          </select>
                        </div>
                        <textarea
                          rows="3"
                          placeholder="Write your comment here..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                        ></textarea>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="submit" disabled={submittingReview}>
                            {submittingReview ? (isEditingReview ? 'Updating...' : 'Submitting...') : (isEditingReview ? 'Update Review' : 'Submit Review')}
                          </button>
                          {isEditingReview && (
                            <button type="button" onClick={() => {
                              setIsEditingReview(false);
                              setReviewComment("");
                              setReviewRating(5);
                            }} style={{ background: '#6b7280' }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      <p className="sp-login-prompt" style={{ color: '#16a34a' }}>
                        You have already reviewed this product.
                      </p>
                    )
                  ) : (
                    <p className="sp-login-prompt">
                      Please <Link to="/UserLogin">login</Link> to leave a review.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="sp-related">
          <h2 className="sp-related-title">More from {product.brand}</h2>
          <div className="sp-related-grid">
            {relatedProducts.map((rp) => (
              <div
                key={rp._id}
                className="sp-related-card"
                onClick={() => navigate(`/product/${rp._id}`)}
              >
                <div className="sp-related-img-wrap">
                  <img src={`${API_BASE}/${rp.image}`} alt={rp.name} />
                </div>
                <div className="sp-related-info">
                  <p className="sp-related-brand">{rp.brand}</p>
                  <h4 className="sp-related-name">{rp.name}</h4>
                  <p className="sp-related-price">MRP ₹{rp.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleProduct;
