/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import NewBillUI from "../views/NewBillUI.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import userEvent from '@testing-library/user-event'
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";

import router from "../app/Router.js";
import DashboardFormUI from "../views/DashboardFormUI.js";

jest.mock("../app/store", () => (mockStore));

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList).toContain("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
          .getAllByText(
              /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          )
          .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    describe("When I click on the New Bill button", () => {
      test("Then it should open a new page", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;
        const billsCurrent = new Bills({ document, onNavigate, store, localStorage: window.localStorage });
        const handleClickNewBill = jest.fn(billsCurrent.handleClickNewBill);
        const newBillBtn = screen.getByTestId("btn-new-bill");
        newBillBtn.addEventListener("click", handleClickNewBill);
        userEvent.click(newBillBtn);
        expect(handleClickNewBill).toHaveBeenCalled();

        const newBill = screen.getByTestId("form-new-bill");
        expect(newBill).toBeTruthy();
      });
    });

    describe("When I click on the eye icon", () => {
      test("Then it should open a modal", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = null;
        const billsCurrent = new Bills({ document, onNavigate, store, localStorage: window.localStorage });
        const handleClickIconEye = jest.fn(billsCurrent.handleClickIconEye);
        const iconEye = screen.getAllByTestId("icon-eye")[0];
        iconEye.addEventListener("click", () => handleClickIconEye(iconEye));
        userEvent.click(iconEye);
        expect(handleClickIconEye).toHaveBeenCalled();

        const modal = screen.getByTestId('modaleFile');
        expect(modal).toBeTruthy();
      })
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills Page", () => {
        test("fetches bills from mock API GET", async () => {
            localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router()
            window.onNavigate(ROUTES_PATH.Bills)
            await waitFor(() => screen.getByText("Mes notes de frais"))
            const table = await screen.getByTestId("tbody");
            expect(table).toBeTruthy();
            const eye = await screen.getAllByTestId("icon-eye");
            expect(eye).toBeTruthy();
        });
    })

    describe("When an error occur on API", () => {

        beforeEach(() => {
            jest.spyOn(mockStore, "bills")
            Object.defineProperty(window, "localStorage", { value: localStorageMock })
            window.localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }))
            const root = document.createElement("div")
            root.setAttribute("id", "root")
            document.body.appendChild(root)
            router()
        })


        test("fetches bills from an API and fails with 404 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                       return  Promise.reject(new Error("Erreur 404"))
                    }
                }
            })
            window.onNavigate(ROUTES_PATH.Bills)
            await new Promise(process.nextTick)
            const message = await screen.getByText(/Erreur 404/)
            expect(message).toBeTruthy()
        })

        test("fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                       return  Promise.reject(new Error("Erreur 500"))
                    }
                }
            })
            window.onNavigate(ROUTES_PATH.Bills)
                await new Promise(process.nextTick)
                const message = await screen.getByText(/Erreur 500/)
                expect(message).toBeTruthy()
        })
    });
})
