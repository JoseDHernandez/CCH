import { Fragment } from "react";
import Logo from "../assets/logo.webp";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useUser } from "../context/User.context";
const navigation = [
  { name: "Cartas", href: "/cards", current: false },
  /*{ name: "Informacion", href: "/info", current: false },*/
];
const userNavigation = [
  { name: "Reglas", href: "/Game/rules", current: false },
  /*{ name: "Cartas Negras", href: "/Game/cardsBlack", current: false },
  { name: "Cartas Blancas", href: "/Game/cardsWhite", current: false },
  { name: "Salas", href: "/", current: false },*/
];
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export const NavBar = () => {
  const { userData, isAuthenticated, logout } = useUser();
  function salir() {
    logout();
  }
  return (
    <Disclosure as="nav" className="bg-black">
      {({ open }) => (
        <>
          <div className="mx-auto  px-5 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1   ">
                <div className="flex flex-shrink-0 items-center sm:justify-start ">
                  <img className="hidden h-8 w-auto lg:block" src={Logo} />
                  <a
                    className=" no-underline text-white text-2xl ml-12 sm:ml-5 "
                    href="/"
                  >
                    Cartas contra la humanidad
                  </a>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-8 ">
                    {isAuthenticated
                      ? userNavigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "rounded-md px-3 py-2 text-base  no-underline"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))
                      : navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "rounded-md px-3 py-2 text-base  no-underline"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Profile dropdown */}
              </div>
              {isAuthenticated ? (
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-1 bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-10 w-10 rounded-1"
                        src={userData.Photo == 1 ? `` : userData.Photo}
                      />
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        <a
                          href="/Game/user"
                          className="block px-4 py-2 text-sm text-gray-700 no-underline hover:text-black"
                        >
                          Perfil
                        </a>
                      </Menu.Item>
                      <Menu.Item>
                        <button
                          onClick={salir}
                          className="block px-4 py-2 text-sm text-gray-700  hover:text-black"
                        >
                          Salir
                        </button>
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              ) : (
                <div className="float-right justify-end bg-sky hidden md:block ">
                  <button
                    className="bg-white p-2 px-3 rounded"
                    key="registerButton"
                  >
                    <Link to={"/register"}>Registro</Link>
                  </button>
                  <span className="px-2"></span>
                  <button
                    className="bg-white p-2 px-3 rounded"
                    key="loginButton"
                  >
                    <Link to={"/login"}>Ingresar</Link>
                  </button>
                </div>
              )}
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium no-underline"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              <Disclosure.Button
                key="registro"
                as="a"
                href="/register"
                className="text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium no-underline"
              >
                Registro
              </Disclosure.Button>
              <Disclosure.Button
                aria-current="page"
                key="Ingresar"
                as="a"
                href="/login"
                className="bg-gray-900 text-white block rounded-md px-3 py-2 text-base font-medium no-underline"
              >
                Ingresar
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
