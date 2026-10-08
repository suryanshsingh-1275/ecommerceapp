import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { inr } from '../utils';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [pays, setPays] = useState([]);
  useEffect(() => {
    api.get('/orders/mine').then((r) => setOrders(r.data));
    api.get('/payments/history').then((r) => setPays(r.data));
  }, []);
  return (
    