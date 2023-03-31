/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";

// Créer une fonction mock pour remplacer window.alert
const mockAlert = jest.fn();
window.alert = mockAlert;


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    describe('When I change file input', () => {
      jest.spyOn(window, "alert")
      test("Then it should upload a new file", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });

        window.localStorage.setItem(
            "user",
            JSON.stringify({
              type: "Employee",
            })
        );

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null;
        const NewCurrentBill = new NewBill({ document, onNavigate, localStorage: window.localStorage, store })

        const handleChangeFile = jest.fn(NewCurrentBill.handleChangeFile)
        const file = screen.getByTestId("file")
        file.addEventListener("change", handleChangeFile)
        userEvent.upload(file, new File(["hello"], "hello.png", { type: "image/png" }))
        expect(handleChangeFile).toHaveBeenCalled()
      })
    })

    describe('When I submit form', () => {
      test("Then it should create a new bill", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Employee",
            })
        )
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname })
        }
        const store = null;
        const NewCurrentBill = new NewBill({ document, onNavigate, localStorage: window.localStorage, store })

        const handleSubmit = jest.fn(NewCurrentBill.handleSubmit)
        const form = screen.getByTestId("form-new-bill")
        form.addEventListener("submit", handleSubmit)
        await userEvent.type(screen.getByTestId("expense-type"), "Restaurant")
        await userEvent.type(screen.getByTestId("expense-name"), "Restau U")
        await userEvent.type(screen.getByTestId("amount"), "200")
        await userEvent.type(screen.getByTestId("datepicker"), "2023-07-22")
        await userEvent.type(screen.getByTestId("vat"), "20")
        await userEvent.type(screen.getByTestId("pct"), "20")
        await userEvent.type(screen.getByTestId("commentary"), "un commentaire")
        const file = screen.getByTestId("file")
        await userEvent.upload(file, new File(["hello"], "hello.png", { type: "image/png" }))
        await userEvent.click(screen.getByTestId("btn-send-bill"))
        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      })
    })
  })
})

/* Test d'intégration Post*/
describe("Given I am a user connected as Employee", () => {
  describe("When I create a bill", () => {
    describe("When an error occurs", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
        test("Then it fails with 404 message error", async () => {
          console.error = jest.fn()
          mockStore.bills.mockImplementationOnce(() => {
            return {
                update: () => {
                  return Promise.reject(new Error("Erreur 404"))
                },
            }
          })
          window.onNavigate(ROUTES_PATH.NewBill)
            await userEvent.type(screen.getByTestId("expense-type"), "Restaurant")
            await userEvent.type(screen.getByTestId("expense-name"), "Restau U")
            await userEvent.type(screen.getByTestId("amount"), "200")
            await userEvent.type(screen.getByTestId("datepicker"), "2023-07-22")
            await userEvent.type(screen.getByTestId("vat"), "20")
            await userEvent.type(screen.getByTestId("pct"), "20")
            await userEvent.type(screen.getByTestId("commentary"), "un commentaire")
            const file = screen.getByTestId("file")
            await userEvent.upload(file, new File(["hello"], "hello.png", { type: "image/png" }))
            await userEvent.click(screen.getByTestId("btn-send-bill"))
            await waitFor(() => {
              expect(console.error).toHaveBeenCalledWith(new Error("Error 404"))
            })
        })
    })
  })
})