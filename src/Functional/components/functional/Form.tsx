'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Person {
    rut: string;
    firstName: string;
    lastNameFather: string;
    lastNameMother: string;
    address: string;
    commune: string;
    email: string;
    phone: string;
}

interface FormErrors {
    rut?: string;
    firstName?: string;
    lastNameFather?: string;
    lastNameMother?: string;
    address?: string;
    commune?: string;
    email?: string;
    phone?: string;
}

export default function UserForm() {

    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState<Person>({
        rut: "",
        firstName: "",
        lastNameFather: "",
        lastNameMother: "",
        address: "",
        commune: "",
        email: "",
        phone: "",
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [communes, setCommunes] = useState<{ id: number; name: string }[]>([]);

    const fetchPersonByRut = async (rut: string) => {

        if (!rut) return;

        try {

            const url =
                `${process.env.NEXT_PUBLIC_API_URL}/person/${rut}`;

            const res = await fetch(url);

            if (!res.ok) {

                return;

            }

            const json = await res.json();

            const person = json.data;

            if (!person) {

                return;

            }

            setFormData({

                rut: person.rut ?? "",
                firstName: person.first_name ?? "",
                lastNameFather: person.last_name_father ?? "",
                lastNameMother: person.last_name_mother ?? "",
                address: person.address ?? "",
                commune: person.commune ?? "",
                email: person.email ?? "",
                phone: person.phone ?? "",
            });

        } catch (err) {

            console.error(
                "Failed to fetch person:",
                err
            );

        }

    };

    useEffect(() => {

        fetchCommunes();

        const rut = searchParams.get("rut");

        if (rut) {

            fetchPersonByRut(rut);

        }

    }, [searchParams]);

    const fetchCommunes = async () => {

        try {

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/commune`
            );

            if (!res.ok) {

                throw new Error(
                    "Failed to fetch communes"
                );

            }

            const json = await res.json();

            setCommunes(json.data);

        } catch (error) {

            console.error(error);

        }

    };

    const handleChange = (
        e:
            React.ChangeEvent<
                HTMLInputElement |
                HTMLSelectElement
            >
    ) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });

        setErrors({

            ...errors,

            [e.target.name]: "",

        });

    };

    const validateForm = () => {

        const newErrors: FormErrors = {};

        const rutRegex = /^\d{7,8}-[\dkK]$/;
        const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{8,15}$/;
        if (
            !formData.rut ||
            !rutRegex.test(formData.rut)
        ) {

            newErrors.rut =
                "El RUT debe tener formato 12345678-9";

        }

        if (
            !formData.firstName ||
            !nameRegex.test(
                formData.firstName
            )
        ) {
            newErrors.firstName = "El nombre solo puede contener letras";
        }

        if (
            !formData.lastNameFather ||
            !nameRegex.test(
                formData.lastNameFather
            )
        ) {
            newErrors.lastNameFather = "Apellido paterno inválido";
        }

        if (
            !formData.lastNameMother ||
            !nameRegex.test(
                formData.lastNameMother
            )
        ) {
            newErrors.lastNameMother = "Apellido materno inválido";
        }

        if (
            !formData.address.trim()
        ) {
            newErrors.address = "La dirección es obligatoria";
        }

        if (!formData.commune) {
            newErrors.commune = "Seleccione una comuna";
        }

        if (
            !formData.email ||
            !emailRegex.test(
                formData.email
            )
        ) {
            newErrors.email = "Correo electrónico inválido";
        }

        if (
            !formData.phone ||
            !phoneRegex.test(
                formData.phone
            )
        ) {
            newErrors.phone = "El teléfono debe tener entre 8 y 15 números";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors)
                .length === 0
        );

    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        if (!validateForm()) {

            return;

        }

        try {

            const url =
                `${process.env.NEXT_PUBLIC_API_URL}/person`;

            const res =
                await fetch(

                    url,

                    {

                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify(
                                formData
                            ),

                    }

                );

            if (!res.ok) {

                const errorText =
                    await res.text();

                console.error(
                    "API ERROR:",
                    errorText
                );

                return;

            }

            const data =
                await res.json();

            console.log(
                "Saved:",
                data
            );

            router.push("/user");

        } catch (err) {

            console.error(
                "REQUEST FAILED:",
                err
            );

        }

    };

    return (

        <form
            onSubmit={handleSubmit}
            className="pb-10 space-y-6 max-w-lg mx-auto "
        >

            <div
                className=" rounded-lg border border-gray-200 bg-white p-6 shadow-md "
            >

                <div className="space-y-4">

                    <div>
                        <label className=" block text-sm font-medium text-gray-700 " > Rut </label>
                        <input type="text" name="rut" value={formData.rut} onChange={handleChange} onBlur={() => fetchPersonByRut(formData.rut)}
                            className="
                                mt-1
                                block
                                w-full
                                rounded-md
                                border
                                border-gray-300
                                p-2.5
                            "
                        />

                        {

                            errors.rut &&

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-red-600
                                "
                            >

                                {
                                    errors.rut
                                }

                            </p>

                        }

                    </div>

                    {

                        [

                            [
                                "Nombre",

                                "firstName",

                                errors.firstName

                            ],

                            [

                                "Apellido Paterno",

                                "lastNameFather",

                                errors.lastNameFather

                            ],

                            [

                                "Apellido Materno",

                                "lastNameMother",

                                errors.lastNameMother

                            ],

                            [

                                "Direccion",

                                "address",

                                errors.address

                            ],

                            [

                                "Correo Electronico",

                                "email",

                                errors.email

                            ],

                            [

                                "Telefono",

                                "phone",

                                errors.phone

                            ]

                        ].map(

                            (

                                [

                                    label,

                                    name,

                                    error

                                ]

                            ) => (

                                <div
                                    key={name}
                                >

                                    <label
                                        className="
                                            block
                                            text-sm
                                            font-medium
                                            text-gray-700
                                        "
                                    >

                                        {label}

                                    </label>

                                    <input

                                        type={

                                            name === "email" ? "email" : "text"
                                        }
                                        name={name}
                                        value={
                                            formData[
                                            name as keyof Person
                                            ]
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2.5"
                                    />
                                    {error &&
                                        <p
                                            className=" mt-1 text-sm text-red-600"
                                        >
                                            {error}
                                        </p>
                                    }
                                </div>
                            )
                        )
                    }
                    <div>
                        <label
                            className="block text-sm font-medium text-gray-700">
                            Comuna
                        </label>

                        <select
                            name="commune"
                            value={formData.commune}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2.5">
                            <option value="">Selecciona la comuna</option>
                            {communes.map((commune) => (
                                <option key={commune.id}
                                    value={commune.name}
                                > {commune.name} </option>
                            ))
                            }
                        </select>
                        {errors.commune &&
                            <p
                                className="mt-1 text-sm text-red-600 ">
                                {errors.commune}
                            </p>
                        }

                    </div>

                    <div className="flex gap-2">
                        <button type="button" onClick={() =>
                            window.location.href = ("/form")
                        }
                            className="w-full rounded-md bg-gray-500 py-2 text-white"
                        >Limpiar
                        </button>

                        <button type="button"
                            onClick={async () => {
                                if (
                                    !formData.rut
                                ) return;
                                await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/person/${formData.rut}`,
                                    { method: "DELETE" }
                                );
                                router.push("/user");
                            }}
                            className="w-full rounded-md bg-red-600 py-2 text-white"
                        >
                            Eliminar
                        </button>

                        <button type="submit" className="w-full rounded-md bg-blue-700 py-2 text-white"
                        >
                            Registrar
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}