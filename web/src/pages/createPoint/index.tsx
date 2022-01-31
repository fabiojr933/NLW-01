import React from "react";
import './style.css';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/logo.svg';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import api from '../../service/api';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import Dropzone from '../../components/dropzone/';

interface Item {
    id: Number;
    title: string;
    image_url: string;
}
interface IBGE {
    sigla: string;
}
interface Cidade {
    nome: string;
}
const CreatPoint = () => {


    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [selectedUF, setSelectedUF] = useState('0');
    const [SelectedCidade, setSelectedCidade] = useState<string[]>([]);
    const [SelectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [InicialPosition, setInicialPosition] = useState<[number, number]>([0, 0]);
    const [SelectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [SelectFile, setSelectFile] = useState<File>();
    const history = useHistory();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });
    function handleSelectItem(id: number) {
        const alreadySelected = SelectedItems.findIndex(item => item === id);
        const filteredItems = SelectedItems.filter(item => item !== id);
        setSelectedItems(filteredItems);
        if (alreadySelected >= 0) {

        } else {
            setSelectedItems([...SelectedItems, id]);
        }

    }
    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    }
    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUF(uf);
    }
    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
    }
    function handlMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }
    async function handlSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = SelectedPosition;
        const items = SelectedItems;


        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('city', city);
        data.append('uf', uf);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
       if(SelectFile){
        data.append('image', SelectFile);
       }


        await api.post('points', data);
        alert('Ponto cadastrado com sucesso');
        history.push('/');
    }
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInicialPosition([latitude, longitude]);
        })
    }, []);

    useEffect(() => {
        api.get('items').then(resposta => {
            setItems(resposta.data);
        });
    }, []);


    useEffect(() => {
        axios.get<IBGE[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const estadoIBGE = response.data.map(uf => uf.sigla);
            setUfs(estadoIBGE);
        })
    }, []);


    useEffect(() => {
        if (selectedUF === '0') {
            return;
        }
        axios.get<Cidade[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
            const cidadeIBGE = response.data.map(cidade => cidade.nome);
            setSelectedCidade(cidadeIBGE);
        })
    }, [selectedUF])


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to='/'>
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>
            <form onSubmit={handlSubmit}>
                <h1>Cadastro do <br /> Ponto de coleta</h1>

                <Dropzone onFileUpload={setSelectFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange} />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" onChange={handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o enderenço no mapa</span>
                    </legend>


                    <Map center={InicialPosition} zoom={15} onClick={handlMapClick}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={SelectedPosition} />
                    </Map>


                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUf}>
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))};
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="cidade">Cidade</label>
                            <select name="cidade" id="cidade" value={selectedCity} onChange={handleSelectCity}>
                                <option value="0">Selecione uma Cidade</option>
                                {SelectedCidade.map(cidade => (
                                    <option key={cidade} value={cidade}>{cidade}</option>
                                ))};
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Item de coleta</h2>
                        <span>Selecione um o mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={Number(item.id)} onClick={() => handleSelectItem(Number(item.id))} className={SelectedItems.includes(Number(item.id)) ? 'selected' : ''}>
                                <img src={item.image_url} alt="Teste" />
                                <span>{item.title}</span>
                            </li>
                        ))}

                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}
export default CreatPoint;