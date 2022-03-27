import "./Consommation.css";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  ChoroplethMap,
  HorizontalSlider,
  TypicalConsumptionDay,
} from "../../components";
import { TotalConsumption } from "../../components";
import { useParams } from "react-router-dom";
import { Profile } from "../../scripts/dbUtils";
import HeaderDropDown from "../../containers/HeaderDropDown/HeaderDropDown";
import { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

function Consommation() {
  const [currentChart, setCurrentChart] = useState(0);

  const buildingTypes = [
    Profile.ALL,
    Profile.RESIDENTIAL,
    Profile.TERTIARY,
    Profile.PROFESSIONAL,
    Profile.PUBLIC_LIGHTING,
  ];
  const labels = [
    "Total",
    "Résidentiels",
    "Tértiaires",
    "Professionnels",
    "Eclairage",
  ];
  const titles = [
    "Consommation quotidienne moyenne de la zone urbaine par rapport au quartier",
    "Consommation quotidienne moyenne résidentielle de la zone urbaine par rapport au quartier",
    "Consommation quotidienne moyenne tertiare de la zone urbaine par rapport au quartier",
    "Consommation quotidienne moyenne professionelle de la zone urbaine par rapport au quartier",
    "Consommation quotidienne moyenne des dispositifs d'éclairage public de la zone urbaine par rapport au quartier",
  ];

  let params = useParams();

  const [chartopen, setChartopen] = useState(false);

  const [dropmenu, setDropmenu] = useState(null);
  const open = Boolean(dropmenu);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDropmenu(event.currentTarget);
  };
  const handleClose = (ind: number) => {
    setDropmenu(null);
    setChartopen(true);
    setCurrentChart(ind);
  };

  return (
    <>
      <HeaderDropDown />
      <div className="consommation-content" key={window.location.pathname}>
        <HorizontalSlider
          children={(t1, t2) => (
            <Container>
              <Row>
                <Col sm={12} md={12} lg={12} xl={6}>
                  <ChoroplethMap t1={t1} t2={t2} />
                </Col>
                <Col sm={12} md={12} lg={12} xl={6}>
                  <TotalConsumption
                    t1={t1}
                    t2={t2}
                    urbanZone={params.zoneName}
                    title={"Consommation par filière"}
                  />
                </Col>
              </Row>
              <div>
                {chartopen == true && (
                  <div key={currentChart}>
                    <TypicalConsumptionDay
                      t1={t1}
                      t2={t2}
                      urbanZone={params.zoneName}
                      buildingType={buildingTypes[currentChart]}
                      title={titles[currentChart]}
                    />
                  </div>
                )}
              </div>

              <div className="menu-div">
                <Button
                  sx={{
                    backgroundColor: "#FFFFFF",
                  }}
                  className="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                >
                  CHOISISSEZ UNE FILIERE
                </Button>
                <Menu
                  id="basic-menu"
                  anchorEl={dropmenu}
                  open={open}
                  onClose={() => handleClose(currentChart)}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  {labels.map((item, index) => {
                    return (
                      <div>
                        <MenuItem
                          onClick={() => handleClose(index)}
                          sx={{
                            color: "#00A3E0",
                          }}
                        >
                          {item}
                        </MenuItem>
                      </div>
                    );
                  })}
                </Menu>
              </div>
            </Container>
          )}
        />
      </div>
    </>
  );
}

export default Consommation;
